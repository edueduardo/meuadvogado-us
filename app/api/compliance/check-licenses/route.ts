import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Background job that runs daily to check license validity
// Automatically suspends lawyers with expired licenses
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify this is a legitimate cron call
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all verified lawyers with expiring/expired licenses
    const expiredLicenses = await prisma.lawyerVerification.findMany({
      where: {
        status: "APPROVED",
        licenseExpiresAt: {
          lte: now, // License expired before today
        },
      },
      include: {
        lawyer: {
          include: { user: true },
        },
      },
    });

    let suspendedCount = 0;
    let notifiedCount = 0;

    for (const verification of expiredLicenses) {
      // Suspend lawyer account
      const suspendedLawyer = await prisma.lawyer.update({
        where: { id: verification.lawyerId },
        data: {
          verified: false,
          suspendedReason: "LICENSE_EXPIRED",
          suspendedAt: now,
        },
      });

      // Update verification status
      await prisma.lawyerVerification.update({
        where: { id: verification.id },
        data: {
          status: "SUSPENDED",
          suspendedAt: now,
          suspendReason: "LICENSE_EXPIRED",
        },
      });

      // Disable all active subscriptions
      if (suspendedLawyer.subscriptionId) {
        await prisma.subscription.update({
          where: { id: suspendedLawyer.subscriptionId },
          data: {
            status: "canceled",
            canceledAt: now,
            cancelReason: "License expired",
          },
        });
      }

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: verification.lawyer.userId,
          action: "LAWYER_SUSPENDED",
          resource: "Lawyer",
          resourceId: verification.lawyerId,
          details: `Lawyer suspended due to expired OAB license. Expires at: ${verification.licenseExpiresAt}`,
          severity: "critical",
        },
      });

      // TODO: Send email notification to lawyer
      console.log(
        `[COMPLIANCE] Suspended lawyer ${verification.lawyer.user.email} - license expired on ${verification.licenseExpiresAt}`
      );

      suspendedCount++;
    }

    // Find lawyers with licenses expiring within 30 days
    const expiringLicenses = await prisma.lawyerVerification.findMany({
      where: {
        status: "APPROVED",
        licenseExpiresAt: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
      include: {
        lawyer: {
          include: { user: true },
        },
      },
    });

    for (const verification of expiringLicenses) {
      // Log warning
      await prisma.auditLog.create({
        data: {
          userId: verification.lawyer.userId,
          action: "LICENSE_EXPIRING_SOON",
          resource: "LawyerVerification",
          resourceId: verification.id,
          details: `License expiring soon: ${verification.licenseExpiresAt}. Days remaining: ${Math.ceil(
            (verification.licenseExpiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )}`,
          severity: "warning",
        },
      });

      // TODO: Send email reminder to lawyer
      console.log(
        `[COMPLIANCE] License expiring soon for ${verification.lawyer.user.email} - expires on ${verification.licenseExpiresAt}`
      );

      notifiedCount++;
    }

    return NextResponse.json(
      {
        success: true,
        summary: {
          suspended: suspendedCount,
          notifiedExpiring: notifiedCount,
          timestamp: now.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("License compliance check error:", error);
    return NextResponse.json(
      { error: "Failed to check license compliance" },
      { status: 500 }
    );
  }
}
