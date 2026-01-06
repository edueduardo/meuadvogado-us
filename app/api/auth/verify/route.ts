import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 400 }
      )
    }

    // Buscar token de verificação
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      )
    }

    // Verificar se token já foi usado
    if (verificationToken.used) {
      return NextResponse.json(
        { error: "Este token já foi utilizado" },
        { status: 400 }
      )
    }

    // Verificar se token expirou
    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json(
        { error: "Token expirado. Solicite um novo email de verificação." },
        { status: 400 }
      )
    }

    // Verificar se email já foi verificado
    if (verificationToken.user.emailVerified) {
      return NextResponse.json(
        { error: "Este email já foi verificado anteriormente" },
        { status: 400 }
      )
    }

    // Marcar token como usado
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { 
        used: true, 
        usedAt: new Date() 
      }
    })

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() }
    })

    return NextResponse.json(
      { success: true, message: "Email verificado com sucesso!" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    )
  }
}
