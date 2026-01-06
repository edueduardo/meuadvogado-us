import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenValid } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar token de verificação
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    if (!isTokenValid(verificationToken.expiresAt)) {
      return NextResponse.json(
        { error: "Token expirou. Solicite um novo email de verificação." },
        { status: 400 }
      );
    }

    // Verificar se já foi verificado
    if (verificationToken.verified) {
      return NextResponse.json(
        { error: "Este email já foi verificado" },
        { status: 400 }
      );
    }

    // Atualizar token como verificado
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    // Atualizar usuário como tendo email verificado
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verificado com sucesso!",
        email: verificationToken.user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email. Tente novamente." },
      { status: 500 }
    );
  }
}
