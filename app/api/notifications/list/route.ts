import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/notifications/NotificationService";

/**
 * GET /api/notifications/list
 * Get user's notifications
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limit = req.nextUrl.searchParams.get("limit") || "20";
    const unreadOnly =
      req.nextUrl.searchParams.get("unreadOnly") === "true" || false;

    let query: any = {
      where: { userId: user.id },
      orderBy: { createdAt: "desc" as const },
      take: parseInt(limit),
    };

    if (unreadOnly) {
      query.where.readAt = null;
    }

    const notifications = await prisma.notification.findMany(query);
    const stats = await notificationService.getStats(user.id);

    return NextResponse.json(
      {
        success: true,
        notifications,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List notifications error:", error);
    return NextResponse.json(
      { error: "Failed to list notifications" },
      { status: 500 }
    );
  }
}
