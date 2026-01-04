// app/api/auth/reset-password/confirm/route.ts
// API para confirmar reset de senha

import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/auth/password-reset";
import { z } from "zod";

const confirmSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar entrada
    const validation = confirmSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { token, newPassword } = validation.data;
    
    // Validar força da senha
    const strengthCheck = PasswordResetService.validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { error: "Senha fraca", details: strengthCheck.errors },
        { status: 400 }
      );
    }
    
    // Confirmar reset
    const result = await PasswordResetService.confirmReset({ 
      token, 
      newPassword 
    });
    
    if (result.success) {
      return NextResponse.json({ 
        message: result.message,
        success: true 
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Password reset confirm error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rate limiting: apenas POST
export async function GET() {
  return NextResponse.json(
    { error: "Método não permitido" },
    { status: 405 }
  );
}
