import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/NotificationService";

/**
 * POST /api/notifications/send
 * Send notification to user (admin/internal use only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      lawyerId,
      clientId,
      type,
      title,
      body,
      actionUrl,
      data,
      priority,
      sendEmail,
      sendPush,
      sendSMS,
    } = await req.json();

    const notification = await notificationService.send({
      type,
      title,
      body,
      userId,
      lawyerId,
      clientId,
      actionUrl,
      data,
      priority,
      sendEmail,
      sendPush,
      sendSMS,
    });

    return NextResponse.json(
      {
        success: true,
        notificationId: notification.id,
        message: "Notification sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
