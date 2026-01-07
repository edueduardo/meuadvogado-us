// app/api/ai/match/route.ts
// Endpoint para matching de advogados com IA

import { NextRequest, NextResponse } from 'next/server'
import { claudeService, CaseAnalysis } from '@/lib/ai/claude-service'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caseAnalysis, clientLocation } = body as {
      caseAnalysis: CaseAnalysis;
      clientLocation: string;
    }

    if (!caseAnalysis) {
      return NextResponse.json(
        { error: 'Análise do caso é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar advogados ativos
    const lawyers = await prisma.lawyer.findMany({
      where: {
        verified: true,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        practiceAreas: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 50,
    })

    // Formatar para o serviço de matching
    const formattedLawyers = lawyers.map(lawyer => ({
      id: lawyer.id,
      name: lawyer.user.name || 'Advogado',
      practiceAreas: lawyer.practiceAreas.map(pa => pa.slug),
      states: lawyer.states || [],
      rating: lawyer.rating || 0,
      reviewCount: lawyer.reviewCount || 0,
      yearsExperience: lawyer.yearsExperience || 0,
      languages: lawyer.languages || ['Portuguese'],
      verified: lawyer.verified,
      plan: lawyer.plan,
    }))

    // Fazer matching
    const matches = await claudeService.matchLawyers({
      caseAnalysis,
      lawyers: formattedLawyers,
      clientLocation: clientLocation || '',
    })

    // Enriquecer com dados completos dos advogados
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const lawyer = await prisma.lawyer.findUnique({
          where: { id: match.lawyerId },
          include: {
            user: {
              select: {
                name: true,
                photo: true,
              },
            },
            practiceAreas: {
              select: {
                name: true,
              },
            },
          },
        })

        return {
          ...match,
          lawyer: lawyer ? {
            id: lawyer.id,
            name: lawyer.user.name,
            photo: lawyer.user.photo,
            headline: lawyer.headline,
            city: lawyer.city,
            state: lawyer.state,
            rating: lawyer.rating,
            reviewCount: lawyer.reviewCount,
            verified: lawyer.verified,
            practiceAreas: lawyer.practiceAreas.map(pa => pa.name),
          } : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      matches: enrichedMatches.filter(m => m.lawyer !== null),
      aiConfigured: claudeService.isConfigured(),
    })

  } catch (error: any) {
    console.error('Error matching lawyers:', error)
    return NextResponse.json(
      { error: error.message || 'Erro no matching' },
      { status: 500 }
    )
  }
}
