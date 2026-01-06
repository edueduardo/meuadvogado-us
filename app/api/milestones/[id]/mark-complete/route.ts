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
      include: { lawyer: true },
    });

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Only lawyers can mark milestones complete" }, { status: 403 });
    }

    const { proof } = await req.json();

    // Get milestone
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { case: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.lawyerId !== user.lawyer?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (milestone.status !== "funded") {
      return NextResponse.json({ error: `Cannot complete milestone with status: ${milestone.status}` }, { status: 400 });
    }

    // Update milestone status
    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Notify client that work is complete and awaiting approval
    const client = await prisma.client.findUnique({
      where: { id: milestone.clientId },
      include: { user: true },
    });

    if (client?.user?.email) {
      // TODO: Send email to client: "Lawyer completed milestone, approve to release payment"
      console.log(`Notification: Milestone completed for client ${client.user.email}`);
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MARK_MILESTONE_COMPLETE",
        resource: "Milestone",
        resourceId: milestone.id,
        details: `Marked milestone ${milestone.title} as complete. Awaiting client approval for payment release.`,
        severity: "info",
      },
    });

    return NextResponse.json(
      {
        success: true,
        milestone: updatedMilestone,
        message: "Milestone marked as complete. Client will be notified to approve payment release.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark milestone complete error:", error);
    return NextResponse.json({ error: "Failed to mark milestone complete" }, { status: 500 });
  }
}
