// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
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

    return NextResponse.json(
      {
        success: true,
        message: "Cadastro realizado com sucesso!",
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
