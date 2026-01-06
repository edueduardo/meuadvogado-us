import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/verify-email/confirm
 * Verify email using code or token
 * Mark user's email as verified and activate account
 */
export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Missing token or userId" },
        { status: 400 }
      );
    }

    // Find and validate token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        token,
        expiresAt: { gt: new Date() }, // Not expired
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Mark email as verified
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Delete all other tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: "EMAIL_VERIFIED",
        resource: "User",
        resourceId: userId,
        details: `Email verified: ${user.email}`,
        severity: "info",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! Your account is now active.",
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
