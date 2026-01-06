import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      include: {
        lawyer: true,
        client: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { reason, description } = await req.json();

    if (!reason || !description) {
      return NextResponse.json(
        { error: "Missing required fields: reason, description" },
        { status: 400 }
      );
    }

    // Get milestone
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        case: true,
        lawyer: { include: { user: true } },
        client: { include: { user: true } },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Only client or lawyer can dispute
    const isClient = milestone.clientId === user.client?.id;
    const isLawyer = milestone.lawyerId === user.lawyer?.id;

    if (!isClient && !isLawyer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only completed or released milestones can be disputed (within 30 days)
    const completedOrReleasedAt = milestone.completedAt || milestone.releasedAt;
    if (!completedOrReleasedAt) {
      return NextResponse.json(
        { error: "Can only dispute completed or released milestones" },
        { status: 400 }
      );
    }

    const daysSince = Math.floor(
      (new Date().getTime() - completedOrReleasedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince > 30) {
      return NextResponse.json(
        { error: "Dispute period has expired (30 days)" },
        { status: 400 }
      );
    }

    // Update milestone status to disputed
    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: "disputed",
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DISPUTE_MILESTONE",
        resource: "Milestone",
        resourceId: milestone.id,
        details: `Dispute filed: ${reason} - ${description}`,
        severity: "warning",
      },
    });

    // Notify admin for manual review
    // TODO: Send email to support with dispute details for manual review

    // Notify other party
    const otherPartyEmail = isClient ? milestone.lawyer?.user?.email : milestone.client?.user?.email;
    if (otherPartyEmail) {
      // TODO: Send notification email
      console.log(`Notification: Dispute filed, notifying ${otherPartyEmail}`);
    }

    return NextResponse.json(
      {
        success: true,
        milestone: updatedMilestone,
        message: "Dispute filed successfully. Our team will review and contact both parties within 48 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dispute milestone error:", error);
    return NextResponse.json({ error: "Failed to file dispute" }, { status: 500 });
  }
}
