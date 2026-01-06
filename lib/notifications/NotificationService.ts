import { prisma } from "@/lib/prisma";

/**
 * Notification Service
 * Handles all notification logic without external dependencies
 * Ready for OneSignal/Firebase integration later
 */

export type NotificationType =
  | "new_lead"
  | "lead_accepted"
  | "new_message"
  | "payment_received"
  | "lead_expiring"
  | "license_expiring"
  | "case_completed"
  | "consultation_reminder"
  | "lead_matched";

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string;
  lawyerId?: string;
  clientId?: string;
  actionUrl?: string;
  priority?: "low" | "normal" | "high";
  sendEmail?: boolean;
  sendPush?: boolean;
  sendSMS?: boolean;
}

class NotificationService {
  /**
   * Create and send notification
   * Stores in DB for audit trail + triggers actual sends
   */
  async send(payload: NotificationPayload) {
    try {
      // Determine recipient
      const userId =
        payload.userId ||
        (payload.lawyerId
          ? (
              await prisma.lawyer.findUnique({
                where: { id: payload.lawyerId },
                select: { userId: true },
              })
            )?.userId
          : null) ||
        (payload.clientId
          ? (
              await prisma.client.findUnique({
                where: { id: payload.clientId },
                select: { userId: true },
              })
            )?.userId
          : null);

      if (!userId) {
        throw new Error("No recipient found");
      }

      // Save notification to DB (for audit + retry)
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          actionUrl: payload.actionUrl,
          priority: payload.priority || "normal",
          status: "pending",
        },
      });

      // Send to different channels
      if (payload.sendPush !== false) {
        await this.sendPushNotification(userId, payload, notification.id);
      }

      if (payload.sendEmail !== false) {
        await this.sendEmailNotification(userId, payload, notification.id);
      }

      if (payload.sendSMS === true) {
        await this.sendSMSNotification(userId, payload, notification.id);
      }

      // Mark as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "sent", sentAt: new Date() },
      });

      return notification;
    } catch (error) {
      console.error("Notification send error:", error);
      throw error;
    }
  }

  /**
   * Send push notification
   * Currently logs to console, ready for OneSignal integration
   */
  private async sendPushNotification(
    userId: string,
    payload: NotificationPayload,
    notificationId: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      // TODO: Integrate with OneSignal or Firebase Cloud Messaging
      // For now, just log (client will fetch via polling)
      console.log(`[PUSH] ${user.email}: ${payload.title}`);

      // In production:
      // await oneSignal.createNotification({
      //   include_external_user_ids: [userId],
      //   headings: { en: payload.title },
      //   contents: { en: payload.body },
      //   data: payload.data,
      //   priority: payload.priority === "high" ? 10 : 5,
      // });
    } catch (error) {
      console.error("Push notification error:", error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: string,
    payload: NotificationPayload,
    notificationId: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      // TODO: Send via Resend
      console.log(`[EMAIL] ${user.email}: ${payload.title}`);
    } catch (error) {
      console.error("Email notification error:", error);
    }
  }

  /**
   * Send SMS notification (optional, for urgent cases)
   */
  private async sendSMSNotification(
    userId: string,
    payload: NotificationPayload,
    notificationId: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.phone) return;

      // TODO: Send via Twilio
      console.log(`[SMS] ${user.phone}: ${payload.title}`);
    } catch (error) {
      console.error("SMS notification error:", error);
    }
  }

  /**
   * Get unread notifications for user
   */
  async getUnread(userId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: {
        userId,
        status: { in: ["sent", "pending"] },
        readAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Get notification stats for user
   */
  async getStats(userId: string) {
    const [unreadCount, today, thisWeek, thisMonth] = await Promise.all([
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return { unreadCount, today, thisWeek, thisMonth };
  }
}

export const notificationService = new NotificationService();
