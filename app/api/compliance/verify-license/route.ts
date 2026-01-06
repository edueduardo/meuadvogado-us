import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mock OAB API - In production, integrate with real OAB service
// Brazilian Bar Association (Ordem dos Advogados do Brasil) API
const verifyOABLicense = async (barNumber: string, state: string): Promise<{
  valid: boolean;
  name?: string;
  specialty?: string;
  licenseExpiresAt?: Date;
  status?: string;
}> => {
  // TODO: Replace with real OAB API call
  // For MVP: Simple mock that validates format

  if (!barNumber || !state) {
    return { valid: false };
  }

  // OAB format: XXXXXX/UF (e.g., "123456/SP")
  const oabRegex = /^\d{6}\/[A-Z]{2}$/;
  if (!oabRegex.test(barNumber)) {
    return { valid: false };
  }

  // Mock response - in production call actual OAB API
  return {
    valid: true,
    status: "ATIVO",
    licenseExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  };
};

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "Only lawyers can verify licenses" }, { status: 403 });
    }

    const { barNumber, state } = await req.json();

    if (!barNumber || !state) {
      return NextResponse.json(
        { error: "Missing required fields: barNumber, state" },
        { status: 400 }
      );
    }

    // Verify with OAB
    const oabVerification = await verifyOABLicense(barNumber, state);

    if (!oabVerification.valid) {
      // Log failed verification attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "VERIFY_LICENSE_FAILED",
          resource: "LawyerVerification",
          resourceId: user.lawyer?.id || "",
          details: `Failed OAB verification: ${barNumber}/${state}`,
          severity: "warning",
        },
      });

      return NextResponse.json(
        { error: "Invalid OAB license. Format should be: XXXXXX/UF (e.g., 123456/SP)" },
        { status: 400 }
      );
    }

    // Create or update verification record
    const verification = await prisma.lawyerVerification.upsert({
      where: { lawyerId: user.lawyer!.id },
      create: {
        lawyerId: user.lawyer!.id,
        barNumber,
        licenseStatus: oabVerification.status || "ATIVO",
        licenseExpiresAt: oabVerification.licenseExpiresAt,
        status: "APPROVED",
        verifiedAt: new Date(),
        verificationMethod: "OAB_API",
      },
      update: {
        barNumber,
        licenseStatus: oabVerification.status || "ATIVO",
        licenseExpiresAt: oabVerification.licenseExpiresAt,
        status: "APPROVED",
        verifiedAt: new Date(),
        verificationMethod: "OAB_API",
      },
    });

    // Update lawyer profile to mark as verified
    const updatedLawyer = await prisma.lawyer.update({
      where: { id: user.lawyer!.id },
      data: {
        verified: true,
        barNumber,
      },
    });

    // Log successful verification
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "VERIFY_LICENSE_SUCCESS",
        resource: "LawyerVerification",
        resourceId: verification.id,
        details: `OAB license verified: ${barNumber}/${state}. Status: ${oabVerification.status}`,
        severity: "info",
      },
    });

    return NextResponse.json(
      {
        success: true,
        verification: {
          id: verification.id,
          barNumber: verification.barNumber,
          status: verification.status,
          licenseExpiresAt: verification.licenseExpiresAt,
          verifiedAt: verification.verifiedAt,
        },
        lawyer: {
          id: updatedLawyer.id,
          verified: updatedLawyer.verified,
          slug: updatedLawyer.slug,
        },
        message: `License verified successfully. Your profile is now marked as verified.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OAB verification error:", error);
    return NextResponse.json({ error: "Failed to verify license" }, { status: 500 });
  }
}
