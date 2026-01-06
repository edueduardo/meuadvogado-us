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
      return NextResponse.json({ error: "Only clients can fund milestones" }, { status: 403 });
    }

    const { paymentMethodId, returnUrl } = await req.json();

    if (!paymentMethodId || !returnUrl) {
      return NextResponse.json(
        { error: "Missing required fields: paymentMethodId, returnUrl" },
        { status: 400 }
      );
    }

    // Get milestone
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { case: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.clientId !== user.client?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (milestone.status !== "pending") {
      return NextResponse.json({ error: `Cannot fund milestone with status: ${milestone.status}` }, { status: 400 });
    }

    // Get or create Stripe customer
    let customer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId = customer?.stripeCustomerId;

    if (!stripeCustomerId) {
      if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
      }
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          role: "CLIENT",
        },
      });
      stripeCustomerId = stripeCustomer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create payment intent for escrow
    // Amount is in cents, Stripe uses cents too
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: milestone.amount,
        currency: milestone.currency,
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        statement_descriptor: `Milestone: ${milestone.title}`,
        metadata: {
          milestoneId: milestone.id,
          caseId: milestone.caseId,
          clientId: milestone.clientId,
          lawyerId: milestone.lawyerId,
          type: "escrow",
        },
      },
      {
        idempotencyKey: milestone.idempotencyKey || undefined,
      }
    );

    if (paymentIntent.status === "succeeded") {
      // Update milestone status
      const updatedMilestone = await prisma.milestone.update({
        where: { id },
        data: {
          status: "funded",
          stripePaymentId: paymentIntent.id,
          stripePaidAt: new Date(),
        },
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "FUND_MILESTONE",
          resource: "Milestone",
          resourceId: milestone.id,
          details: `Funded milestone ${milestone.title} with ${milestone.amount / 100} ${milestone.currency.toUpperCase()}`,
          severity: "info",
        },
      });

      return NextResponse.json(
        {
          success: true,
          milestone: updatedMilestone,
          message: "Milestone funded successfully. Payment is held in escrow.",
        },
        { status: 200 }
      );
    } else if (paymentIntent.status === "requires_action") {
      // Return client secret for 3D Secure or other SCA
      return NextResponse.json(
        {
          success: false,
          clientSecret: paymentIntent.client_secret,
          requiresAction: true,
          message: "Additional authentication required",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Payment failed: " + paymentIntent.status }, { status: 400 });
    }
  } catch (error) {
    console.error("Fund milestone error:", error);
    const message = error instanceof Error ? error.message : "Failed to fund milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
