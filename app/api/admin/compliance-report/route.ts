import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin endpoint to view compliance status of all lawyers
 * Shows verification status, license expiry, suspended status
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get query parameters for filtering
    const status = req.nextUrl.searchParams.get("status"); // verified, suspended, pending
    const expiringDays = req.nextUrl.searchParams.get("expiringDays"); // licenses expiring within X days
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const offset = req.nextUrl.searchParams.get("offset") || "0";

    const now = new Date();
    const expiringDaysNum = expiringDays ? parseInt(expiringDays) : 30;

    // Build where clause
    const whereClause: any = {};

    if (status === "verified") {
      whereClause.lawyer = { verified: true };
    } else if (status === "suspended") {
      whereClause.lawyer = { verified: false, suspendedAt: { not: null } };
    } else if (status === "pending") {
      whereClause.status = "PENDING";
    }

    if (expiringDays) {
      whereClause.licenseExpiresAt = {
        gt: now,
        lte: new Date(now.getTime() + expiringDaysNum * 24 * 60 * 60 * 1000),
      };
    }

    // Get compliance records
    const verifications = await prisma.lawyerVerification.findMany({
      where: whereClause,
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Get stats
    const totalLawyers = await prisma.lawyer.count();
    const verifiedCount = await prisma.lawyer.count({
      where: { verified: true },
    });
    const suspendedCount = await prisma.lawyer.count({
      where: { verified: false, suspendedAt: { not: null } },
    });
    const expiringCount = await prisma.lawyerVerification.count({
      where: {
        status: "APPROVED",
        licenseExpiresAt: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalLawyers,
          verified: verifiedCount,
          suspended: suspendedCount,
          expiringIn30Days: expiringCount,
        },
        verifications: verifications.map((v: any) => ({
          id: v.id,
          lawyer: {
            id: v.lawyer.id,
            name: v.lawyer.user.name,
            email: v.lawyer.user.email,
            verified: v.lawyer.verified,
            suspended: v.lawyer.suspendedAt ? true : false,
          },
          barNumber: v.barNumber,
          status: v.status,
          licenseExpiresAt: v.licenseExpiresAt,
          verifiedAt: v.verifiedAt,
          suspendReason: v.suspendReason,
          daysUntilExpiry: v.licenseExpiresAt
            ? Math.ceil((v.licenseExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            : null,
        })),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: verifications.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Compliance report error:", error);
    return NextResponse.json(
      { error: "Failed to get compliance report" },
      { status: 500 }
    );
  }
}
