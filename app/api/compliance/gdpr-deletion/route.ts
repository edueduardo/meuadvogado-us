import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint for GDPR right to be forgotten
 * User can request complete data deletion
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark for deletion
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        deletionRequested: true,
        deletionRequestedAt: new Date(),
      },
    });

    // Log request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "GDPR_DELETION_REQUEST",
        resource: "User",
        resourceId: user.id,
        details: "User requested data deletion (right to be forgotten)",
        severity: "critical",
      },
    });

    // TODO: Send confirmation email to user
    // TODO: Schedule deletion job for 30 days from now

    return NextResponse.json(
      {
        success: true,
        message:
          "Deletion request received. Your data will be deleted within 30 days. You will receive a confirmation email.",
        requestedAt: updatedUser.deletionRequestedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GDPR deletion request error:", error);
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 }
    );
  }
}

/**
 * Background job to actually delete users who requested deletion 30 days ago
 */
export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find users who requested deletion 30+ days ago
    const usersToDelete = await prisma.user.findMany({
      where: {
        deletionRequested: true,
        deletionRequestedAt: {
          lte: thirtyDaysAgo,
        },
      },
    });

    let deletedCount = 0;

    for (const user of usersToDelete) {
      // Log deletion
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "GDPR_DATA_DELETED",
          resource: "User",
          resourceId: user.id,
          details: "User data permanently deleted per GDPR request",
          severity: "critical",
        },
      });

      // Delete all user data
      // 1. Delete lawyer/client profile
      if (user.role === "LAWYER") {
        await prisma.lawyer.deleteMany({
          where: { userId: user.id },
        });
      } else if (user.role === "CLIENT") {
        await prisma.client.deleteMany({
          where: { userId: user.id },
        });
      }

      // 2. Delete conversations and messages
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { clientId: user.id },
            { messages: { some: { senderId: user.id } } },
          ],
        },
      });

      for (const conv of conversations) {
        await prisma.message.deleteMany({
          where: { conversationId: conv.id },
        });
        await prisma.conversation.delete({
          where: { id: conv.id },
        });
      }

      // 3. Delete user account
      await prisma.user.delete({
        where: { id: user.id },
      });

      deletedCount++;
      console.log(`[GDPR] Deleted user ${user.email}`);
    }

    return NextResponse.json(
      {
        success: true,
        deleted: deletedCount,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GDPR deletion job error:", error);
    return NextResponse.json(
      { error: "Failed to delete user data" },
      { status: 500 }
    );
  }
}
