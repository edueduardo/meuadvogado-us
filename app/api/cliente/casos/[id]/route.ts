import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id: caseId } = await params

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
        practiceArea: true,
        analysis: true,
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 })
    }

    if (!caseData.client) {
      return NextResponse.json({ error: 'Caso sem cliente associado' }, { status: 400 })
    }

    // Verificar se o caso pertence ao cliente autenticado
    if (caseData.client.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Formatar a resposta
    const formattedCase = {
      id: caseData.id,
      description: caseData.description,
      practiceArea: caseData.practiceArea?.name || 'N/A',
      contactCity: caseData.contactCity,
      contactState: caseData.contactState,
      status: caseData.status,
      createdAt: caseData.createdAt,
      analysis: caseData.analysis,
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
