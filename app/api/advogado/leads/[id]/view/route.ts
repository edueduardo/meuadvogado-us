import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/advogado/leads/[id]/view
// Registra que advogado visualizou um lead
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id: leadId } = await params
    
    // Verificar se lead existe
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      select: { id: true, status: true }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    // Registrar ou atualizar visualização
    const leadView = await prisma.leadView.upsert({
      where: {
        caseId_lawyerId: {
          caseId: leadId,
          lawyerId: session.user.id,
        },
      },
      create: {
        caseId: leadId,
        lawyerId: session.user.id,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      leadView: {
        id: leadView.id,
        viewedAt: leadView.viewedAt,
      },
    })
  } catch (error: any) {
    console.error('Error registering lead view:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar visualização' },
      { status: 500 }
    )
  }
}

// GET /api/advogado/leads/[id]/view
// Busca histórico de visualizações de um lead
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas admin pode ver histórico' },
        { status: 403 }
      )
    }

    const { id: leadId } = await params

    const views = await prisma.leadView.findMany({
      where: { caseId: leadId },
      include: {
        lawyer: {
          select: {
            id: true,
            slug: true,
            bio: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      views: views.map((v: any) => ({
        id: v.id,
        viewedAt: v.viewedAt,
        lawyer: v.lawyer,
      })),
      total: views.length,
    })
  } catch (error: any) {
    console.error('Error fetching lead views:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar visualizações' },
      { status: 500 }
    )
  }
}
