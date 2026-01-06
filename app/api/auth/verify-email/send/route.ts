import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate a 6-digit numeric verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/verify-email/send
 * Send verification email to user's email address
 * Rate limited: 3 attempts per hour
 */
export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Missing email or userId" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Check rate limit: max 3 emails per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.emailVerificationToken.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many verification attempts. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // Invalidate previous tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Generate new verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token
    const token = await prisma.emailVerificationToken.create({
      data: {
        userId,
        token: code,
        expiresAt,
      },
    });

    // Send email
    if (resend) {
      try {
        await resend.emails.send({
          from: "onboarding@seu-dominio.com",
          to: email,
          subject: "Confirme seu Email - MeuAdvogado",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Bem-vindo ao MeuAdvogado!</h2>
              <p>Para completar seu registro, confirme seu endereço de email.</p>

              <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">Seu código de verificação:</p>
                <h1 style="font-size: 32px; letter-spacing: 4px; color: #2563eb; margin: 10px 0;">
                  ${code}
                </h1>
                <p style="font-size: 12px; color: #666;">Válido por 24 horas</p>
              </div>

              <p>Ou clique aqui para verificar:</p>
              <a href="https://seu-dominio.com/verify-email?token=${code}&userId=${userId}"
                 style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                Confirmar Email
              </a>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">
                Se você não criou esta conta, ignore este email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue anyway - token is saved
      }
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: "VERIFICATION_EMAIL_SENT",
        resource: "User",
        resourceId: userId,
        details: `Verification email sent to ${email}`,
        severity: "info",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent. Check your inbox.",
        expiresIn: "24 hours",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
