// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, getTokenExpirationDate } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "LAWYER"]),
  // Campos específicos para advogados
  city: z.string().optional(),
  state: z.string().optional(),
  barNumber: z.string().optional(),
  barState: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: validatedData.role,
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    // Se for advogado, criar perfil de advogado
    if (validatedData.role === "LAWYER") {
      const slug = validatedData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await prisma.lawyer.create({
        data: {
          userId: user.id,
          slug: `${slug}-${user.id.slice(-6)}`,
          city: validatedData.city || "",
          state: validatedData.state || "",
          barNumber: validatedData.barNumber,
          barState: validatedData.barState,
          plan: "FREE",
          verified: false,
          active: true,
        },
      });
    }

    // Se for cliente, criar perfil de cliente
    if (validatedData.role === "CLIENT") {
      await prisma.client.create({
        data: {
          userId: user.id,
          city: validatedData.city,
          state: validatedData.state,
        },
      });
    }

    // Gerar token de verificação de email
    const verificationToken = generateSecureToken()
    const tokenExpiresAt = getTokenExpirationDate(24)

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: tokenExpiresAt,
      }
    })

    // Enviar email de verificação
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    await sendEmail({
      to: user.email,
      subject: "✅ Confirme seu email - MeuAdvogado",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Bem-vindo ao MeuAdvogado!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Olá <strong>${user.name}</strong>,</p>
            <p style="color: #666; font-size: 16px;">Obrigado por se cadastrar! Para ativar sua conta, clique no botão abaixo para confirmar seu email:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Confirmar Email
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">Link válido por 24 horas.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Próximos passos:</strong><br>
                1. Confirme seu email<br>
                2. Complete seu perfil<br>
                3. Comece a usar a plataforma
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
      {
        success: true,
        message: "Cadastro realizado com sucesso! Verifique seu email.",
        requiresEmailVerification: true,
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
