import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const caseId = params.id

    // Buscar o caso com todas as informações relacionadas
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        matches: {
          include: {
            lawyer: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            score: 'desc',
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 })
    }

    // Verificar se o caso pertence ao cliente autenticado
    if (caseData.client.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Formatar a resposta
    const formattedCase = {
      id: caseData.id,
      description: caseData.description,
      practiceArea: caseData.practiceArea,
      city: caseData.city,
      state: caseData.state,
      status: caseData.status,
      urgency: caseData.urgency,
      createdAt: caseData.createdAt,
      aiAnalysis: caseData.aiAnalysis as any,
      matches: caseData.matches.map((match) => ({
        id: match.id,
        score: match.score,
        lawyer: {
          id: match.lawyer.id,
          user: {
            name: match.lawyer.user.name,
          },
          city: match.lawyer.city,
          state: match.lawyer.state,
          practiceAreas: match.lawyer.practiceAreas,
          rating: match.lawyer.rating,
          reviewCount: match.lawyer.reviewCount,
        },
      })),
    }

    return NextResponse.json({ case: formattedCase })
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar caso' },
      { status: 500 }
    )
  }
}
