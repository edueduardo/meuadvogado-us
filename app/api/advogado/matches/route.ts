/**
 * API PARA BUSCAR MATCHES DO ADVOGADO LOGADO
 * 
 * GET /api/advogado/matches
 * - Retorna todos os leads aceitos pelo advogado
 * - Inclui status, scores, conversas
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/advogado/matches
// Buscar todos os matches do advogado logado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Não autorizado - apenas advogados' },
        { status: 401 }
      )
    }

    // Buscar lawyer ID do usuário
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Perfil de advogado não encontrado' },
        { status: 404 }
      )
    }

    // Buscar todos os matches deste advogado
    const matches = await prisma.leadMatch.findMany({
      where: { lawyerId: lawyer.id },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true,
            createdAt: true,
            practiceArea: {
              select: { name: true }
            },
            client: {
              select: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        lawyer: {
          select: {
            id: true,
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { matchedAt: 'desc' }
    })

    // Buscar conversas relacionadas
    const conversationIds = matches.map(m => m.caseId).filter(Boolean)
    const conversations = conversationIds.length > 0 
      ? await prisma.conversation.findMany({
          where: {
            lawyerId: lawyer.id,
            caseId: { in: conversationIds as string[] }
          },
          select: {
            id: true,
            caseId: true,
            status: true,
            createdAt: true
          }
        })
      : []

    // Mapear conversas para os matches
    const matchesWithConversations = matches.map(match => ({
      id: match.id,
      status: match.status,
      matchedAt: match.matchedAt,
      respondedAt: match.respondedAt,
      convertedAt: match.convertedAt,
      matchScore: match.matchScore,
      metadata: match.metadata,
      case: {
        id: match.case.id,
        title: match.case.title || 'Lead sem título',
        status: match.case.status,
        description: match.case.description,
        practiceArea: match.case.practiceArea,
        client: match.case.client
      },
      conversationId: conversations.find(c => c.caseId === match.caseId)?.id
    }))

    // Calcular estatísticas
    const stats = {
      total: matches.length,
      active: matches.filter(m => m.status === 'ACTIVE').length,
      converted: matches.filter(m => m.status === 'CONVERTED').length,
      declined: matches.filter(m => m.status === 'DECLINED').length,
      expired: matches.filter(m => m.status === 'EXPIRED').length,
      conversionRate: matches.length > 0 
        ? Math.round((matches.filter(m => m.status === 'CONVERTED').length / matches.length) * 100)
        : 0,
      avgMatchScore: matches.length > 0
        ? Math.round(matches.reduce((sum, m) => sum + (m.matchScore || 0), 0) / matches.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      matches: matchesWithConversations,
      stats,
      lawyerId: lawyer.id
    })

  } catch (error: any) {
    console.error('Error fetching lawyer matches:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar matches' },
      { status: 500 }
    )
  }
}
