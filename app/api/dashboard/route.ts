import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // BLOCKED: Autenticação não implementada
    // TODO: Implementar autenticação real e extrair userId do contexto de usuário logado
    return NextResponse.json(
      { error: 'Endpoint bloqueado: autenticação não está implementada. Implemente o sistema de autenticação para ativar este endpoint.' },
      { status: 401 }
    );

    // Quando autenticação estiver implementada, descomentar e usar userId real:
    // const userId = session.user.id; // Extrair de contexto autenticado (NextAuth, etc)
    // const lawyer = await prisma.lawyerProfile.findUnique({
    //   where: { userId },
    //   include: { ... }
    // });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
