// app/api/auth/reset-password/request/route.ts
// API para solicitar reset de senha

import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/auth/password-reset";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar entrada
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    
    // Solicitar reset
    const result = await PasswordResetService.requestReset({ email });
    
    if (result.success) {
      return NextResponse.json({ 
        message: result.message,
        success: true 
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Password reset request error:", error);
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
