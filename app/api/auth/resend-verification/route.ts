import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, getTokenExpirationDate, isTokenValid } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Este email já foi verificado" },
        { status: 400 }
      );
    }

    // Buscar último token
    const lastToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Se token recente e válido, rejeitar para evitar spam
    if (lastToken && isTokenValid(lastToken.expiresAt)) {
      return NextResponse.json(
        { error: "Um email foi enviado recentemente. Tente novamente em 5 minutos." },
        { status: 429 }
      );
    }

    // Gerar novo token
    const verificationToken = generateSecureToken();
    const tokenExpiresAt = getTokenExpirationDate(24);

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: tokenExpiresAt,
      },
    });

    // Enviar email
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "✅ Novo link de verificação - MeuAdvogado",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">Confirme seu email</h2>
          <p>Olá ${user.name},</p>
          <p>Clique no botão abaixo para verificar seu email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Ou copie e cole este link no seu navegador:<br>
            <code>${verificationUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px;">
            Link válido por 24 horas.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Email de verificação reenviado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    );
  }
}
