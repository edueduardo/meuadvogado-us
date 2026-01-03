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

    if (session.user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id: leadId } = await params

    // Buscar o lead (que é um Case) com todas as informações
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      include: {
        client: {
          include: {
            user: {
              select: {
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

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Verificar se o advogado tem acesso a este lead
    const hasAccess = lead.practiceArea

    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Calcular quality score baseado em vários fatores
    let qualityScore = 50 // Base score

    // +20 se descrição tem mais de 100 caracteres
    if (lead.description.length > 100) qualityScore += 20

    // +15 se tem cidade e estado
    if (lead.contactCity && lead.contactState) qualityScore += 15

    // +15 se tem área específica
    if (lead.practiceArea) qualityScore += 15

    // Formatar a resposta
    const formattedLead = {
      id: lead.id,
      description: lead.description,
      practiceArea: lead.practiceArea?.name || 'N/A',
      contactCity: lead.contactCity,
      contactState: lead.contactState,
      status: lead.status,
      createdAt: lead.createdAt,
      qualityScore: Math.min(qualityScore, 100),
      client: {
        name: lead.client?.user.name || lead.contactName,
        email: lead.client?.user.email || lead.contactEmail,
        phone: lead.contactPhone,
      },
      analysis: lead.analysis,
    }

    return NextResponse.json({ lead: formattedLead })
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
      { status: 500 }
    )
  }
}
