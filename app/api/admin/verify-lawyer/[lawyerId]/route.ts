import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin endpoint to manually verify a lawyer's license
 * Used when automatic OAB verification fails
 * Admin must upload and verify documents manually
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lawyerId: string }> }
) {
  const { lawyerId } = await params;

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

    const { status, licenseExpiresAt, barNumber, notes } = await req.json();

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    // Get lawyer
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: { user: true },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    // Get or create verification record
    const existingVerification = await prisma.lawyerVerification.findUnique({
      where: { lawyerId },
    });

    const verification = existingVerification
      ? await prisma.lawyerVerification.update({
          where: { lawyerId },
          data: {
            status: status as any,
            barNumber: barNumber || existingVerification.barNumber,
            licenseExpiresAt: licenseExpiresAt ? new Date(licenseExpiresAt) : existingVerification.licenseExpiresAt,
            verifiedAt: new Date(),
            verificationMethod: "MANUAL_ADMIN",
            verificationNotes: notes,
          },
        })
      : await prisma.lawyerVerification.create({
          data: {
            lawyerId,
            status: status as any,
            barNumber: barNumber || "MANUAL_VERIFICATION",
            licenseExpiresAt: licenseExpiresAt ? new Date(licenseExpiresAt) : null,
            verifiedAt: new Date(),
            verificationMethod: "MANUAL_ADMIN",
            verificationNotes: notes,
          },
        });

    // Update lawyer verification status
    await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        verified: status === "APPROVED",
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MANUAL_LAWYER_VERIFICATION",
        resource: "LawyerVerification",
        resourceId: verification.id,
        details: `Admin manual verification: ${status}. Notes: ${notes}`,
        severity: status === "REJECTED" ? "warning" : "info",
      },
    });

    // TODO: Send email to lawyer with result

    return NextResponse.json(
      {
        success: true,
        verification: {
          id: verification.id,
          status: verification.status,
          verificationMethod: verification.verificationMethod,
          verifiedAt: verification.verifiedAt,
        },
        lawyer: {
          id: lawyer.id,
          verified: status === "APPROVED",
          barNumber: verification.barNumber,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Manual verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify lawyer" },
      { status: 500 }
    );
  }
}
