import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Only clients can release milestone payments" }, { status: 403 });
    }

    // Get milestone
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        lawyer: { include: { user: true } },
        case: true,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.clientId !== user.client?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (milestone.status !== "completed") {
      return NextResponse.json(
        { error: `Cannot release milestone with status: ${milestone.status}. Must be 'completed' first.` },
        { status: 400 }
      );
    }

    if (!milestone.stripePaymentId) {
      return NextResponse.json({ error: "No Stripe payment found for this milestone" }, { status: 400 });
    }

    // Create transfer to lawyer's account
    // TODO: In production, use Stripe Connect for platform fees
    // For now, we'll transfer to lawyer's bank account via Stripe

    // Get or create lawyer's Stripe customer (for Connect account)
    let lawyerStripeAccount = milestone.lawyer?.user?.stripeConnectId;

    if (!lawyerStripeAccount) {
      // Create Stripe Connect account for lawyer if they don't have one
      if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
      }
      const lawyerAccount = await stripe.accounts.create({
        type: "express",
        email: milestone.lawyer?.user?.email,
        individual: {
          email: milestone.lawyer?.user?.email,
          first_name: milestone.lawyer?.user?.name?.split(" ")[0],
          last_name: milestone.lawyer?.user?.name?.split(" ").pop(),
        },
        business_type: "individual",
        metadata: {
          lawyerId: milestone.lawyerId,
          userId: milestone.lawyer?.userId,
        },
      });

      lawyerStripeAccount = lawyerAccount.id;

      // Save to database
      await prisma.user.update({
        where: { id: milestone.lawyer!.userId },
        data: { stripeConnectId: lawyerStripeAccount },
      });
    }

    // Calculate platform fee (take 10% of milestone amount)
    const platformFee = Math.round(milestone.amount * 0.1); // 10% commission
    const lawyerAmount = milestone.amount - platformFee;

    // Transfer funds to lawyer
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }
    try {
      await stripe.transfers.create({
        amount: lawyerAmount,
        currency: milestone.currency,
        destination: lawyerStripeAccount,
        source_transaction: milestone.stripePaymentId,
        transfer_group: `milestone-${milestone.id}`,
        metadata: {
          milestoneId: milestone.id,
          caseId: milestone.caseId,
          lawyerId: milestone.lawyerId,
        },
      });
    } catch (stripError) {
      console.error("Stripe transfer error:", stripError);
      // If transfer fails, we can retry later
      return NextResponse.json(
        { error: "Failed to process transfer to lawyer account" },
        { status: 400 }
      );
    }

    // Update milestone status
    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: "released",
        releasedAt: new Date(),
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RELEASE_MILESTONE",
        resource: "Milestone",
        resourceId: milestone.id,
        details: `Released milestone payment: R$ ${milestone.amount / 100} (R$ ${lawyerAmount / 100} to lawyer, R$ ${platformFee / 100} platform fee)`,
        severity: "info",
      },
    });

    // Notify lawyer
    if (milestone.lawyer?.user?.email) {
      // TODO: Send email to lawyer: "Payment released, check your bank account"
      console.log(`Notification: Payment released to lawyer ${milestone.lawyer.user.email}`);
    }

    return NextResponse.json(
      {
        success: true,
        milestone: updatedMilestone,
        payment: {
          total: milestone.amount / 100,
          lawyerReceives: lawyerAmount / 100,
          platformFee: platformFee / 100,
          currency: milestone.currency,
        },
        message: `Payment released successfully. Lawyer will receive R$ ${lawyerAmount / 100} in their bank account within 1-2 business days.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Release milestone error:", error);
    const message = error instanceof Error ? error.message : "Failed to release milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
