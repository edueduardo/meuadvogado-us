import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSecureToken, getTokenExpirationDate } from "@/lib/auth-helpers"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Este email já foi verificado" },
        { status: 400 }
      )
    }

    // Buscar último token
    const lastToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Se token recente e válido, rejeitar para evitar spam (5 minutos)
    if (lastToken && lastToken.expiresAt > new Date() && !lastToken.used) {
      const timeDiff = lastToken.expiresAt.getTime() - new Date().getTime()
      const minutesDiff = Math.ceil(timeDiff / (1000 * 60))
      
      return NextResponse.json(
        { error: `Um email foi enviado recentemente. Tente novamente em ${minutesDiff} minutos.` },
        { status: 429 }
      )
    }

    // Gerar novo token
    const verificationToken = generateSecureToken()
    const tokenExpiresAt = getTokenExpirationDate(24)

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: tokenExpiresAt,
      }
    })

    // Enviar email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}` 

    await sendEmail({
      to: user.email,
      subject: "✅ Novo link de verificação - MeuAdvogado",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Confirme seu Email</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Olá <strong>${user.name}</strong>,</p>
            <p style="color: #666; font-size: 16px;">Clique no botão abaixo para verificar seu email e ativar sua conta:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verificar Email
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">Link válido por 24 horas.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Não solicitou este email?</strong><br>
                Ignore esta mensagem. Sua conta permanecerá como está.
              </p>
            </div>
          </div>
          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>MeuAdvogado.us - Conectando brasileiros aos melhores advogados nos EUA</p>
          </div>
        </div>
      `
    })

    return NextResponse.json(
      { success: true, message: "Email de verificação reenviado com sucesso!" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    )
  }
}
