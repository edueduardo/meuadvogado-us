/**
 * ALGORITMO DE MATCHING INTELIGENTE
 * 
 * Calcula score 0-100 baseado em compatibilidade advogado x lead
 * 
 * Fatores:
 * - Área de prática (50 pts): 100% match = 50pts
 * - Localização (20 pts): mesmo estado = 20pts
 * - Disponibilidade (15 pts): online = 15pts
 * - Avaliação (15 pts): 5 estrelas = 15pts
 */

import { prisma } from './prisma'
import { isAfter, subDays } from 'date-fns'

export interface MatchFactors {
  practiceAreaScore: number
  locationScore: number
  availabilityScore: number
  ratingScore: number
  totalScore: number
  factors: {
    practiceAreaMatch: boolean
    sameState: boolean
    isOnline: boolean
    avgRating: number
    daysSinceLastActive: number
  }
}

export interface MatchingResult {
  lawyerId: string
  leadId: string
  score: number
  factors: MatchFactors
  recommendation: 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * Calcula score de matching para um advogado vs lead
 */
export async function calculateMatchScore(
  lawyerId: string,
  leadId: string
): Promise<MatchingResult> {
  try {
    // Buscar dados do advogado
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: {
        user: {
          select: { email: true, name: true }
        },
        practiceAreas: {
          include: {
            practiceArea: {
              select: { name: true }
            }
          }
        },
        reviews: {
          select: { rating: true }
        }
      }
    })

    if (!lawyer) {
      throw new Error('Advogado não encontrado')
    }

    // Buscar dados do lead
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      include: {
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
    })

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    // 1. SCORE ÁREA DE PRÁTICA (50 pontos)
    const practiceAreaMatch = lawyer.practiceAreas.some(
      (pa: any) => pa.practiceArea.name === lead.practiceArea.name
    )
    const practiceAreaScore = practiceAreaMatch ? 50 : 0

    // 2. SCORE LOCALIZAÇÃO (20 pontos)
    // Simplificado: assumir que advogados em SP têm vantagem para leads em SP
    // Futuro: implementar campos de cidade/estado no Lawyer model
    let locationScore = 10 // Score base para todos
    let sameState = true   // Assumir mesmo estado por enquanto

    // 3. SCORE DISPONIBILIDADE (15 pontos)
    // Simplificado: assumir que advogados verificados estão ativos
    const availabilityScore = lawyer.verified ? 15 : 5

    // 4. SCORE AVALIAÇÃO (15 pontos)
    const avgRating = lawyer.reviews.length > 0
      ? lawyer.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / lawyer.reviews.length
      : 0
    
    const ratingScore = Math.min(15, (avgRating / 5) * 15)

    // Calcular score total
    const totalScore = Math.round(practiceAreaScore + locationScore + availabilityScore + ratingScore)

    // Determinar recomendação
    let recommendation: 'HIGH' | 'MEDIUM' | 'LOW'
    if (totalScore >= 70) recommendation = 'HIGH'
    else if (totalScore >= 50) recommendation = 'MEDIUM'
    else recommendation = 'LOW'

    const factors: MatchFactors = {
      practiceAreaScore,
      locationScore,
      availabilityScore,
      ratingScore,
      totalScore,
      factors: {
        practiceAreaMatch,
        sameState,
        isOnline: lawyer.verified,
        avgRating: Math.round(avgRating * 10) / 10,
        daysSinceLastActive: 0 // Simplificado
      }
    }

    return {
      lawyerId,
      leadId,
      score: totalScore,
      factors,
      recommendation
    }

  } catch (error) {
    console.error('Error calculating match score:', error)
    throw error
  }
}

/**
 * Obtém leads recomendados para um advogado
 */
export async function getRecommendedLeads(
  lawyerId: string,
  limit: number = 10
): Promise<MatchingResult[]> {
  try {
    // Buscar leads disponíveis (status NEW)
    const availableLeads = await prisma.case.findMany({
      where: {
        status: 'NEW'
        // TODO: Implementar filtro para excluir leads já matchados quando relação estiver correta
      },
      include: {
        practiceArea: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 3 // Buscar mais para filtrar depois
    })

    if (availableLeads.length === 0) {
      return []
    }

    // Calcular score para cada lead
    const matchPromises = availableLeads.map((lead: any) => 
      calculateMatchScore(lawyerId, lead.id)
    )

    const matches = await Promise.all(matchPromises)

    // Filtrar e ordenar por score
    return matches
      .filter((match: any) => match.score >= 30) // Mínimo 30 pontos
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)

  } catch (error) {
    console.error('Error getting recommended leads:', error)
    throw error
  }
}

/**
 * Atualiza score de todos os matches existentes
 */
export async function updateAllMatchScores(): Promise<void> {
  try {
    // Buscar todos os matches existentes
    const existingMatches = await prisma.leadMatch.findMany({
      select: { lawyerId: true, caseId: true, id: true }
    })

    console.log(`Atualizando ${existingMatches.length} matches...`)

    // Atualizar cada match
    for (const match of existingMatches) {
      try {
        const result = await calculateMatchScore(match.lawyerId, match.caseId)
        
        await prisma.leadMatch.update({
          where: { id: match.id },
          data: {
            matchScore: result.score,
            metadata: {
              algorithm: 'v2.0',
              factors: result.factors as any, // Type cast para Json
              recommendation: result.recommendation,
              calculatedAt: new Date().toISOString()
            } as any
          }
        })

        console.log(`Match ${match.id}: score ${result.score} (${result.recommendation})`)
      } catch (error) {
        console.error(`Error updating match ${match.id}:`, error)
      }
    }

    console.log('Atualização de scores concluída!')

  } catch (error) {
    console.error('Error updating all match scores:', error)
    throw error
  }
}

/**
 * Obtém top advogados para um lead específico
 */
export async function getTopLawyersForLead(
  leadId: string,
  limit: number = 5
): Promise<MatchingResult[]> {
  try {
    // Buscar todos os advogados ativos
    const activeLawyers = await prisma.lawyer.findMany({
      where: {
        // Apenas advogados verificados
        verified: true
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      },
      take: 50 // Limitar para performance
    })

    if (activeLawyers.length === 0) {
      return []
    }

    // Calcular score para cada advogado
    const matchPromises = activeLawyers.map((lawyer: any) => 
      calculateMatchScore(lawyer.id, leadId)
    )

    const matches = await Promise.all(matchPromises)

    // Filtrar e ordenar por score
    return matches
      .filter((match: any) => match.score >= 40) // Mínimo 40 pontos
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)

  } catch (error) {
    console.error('Error getting top lawyers for lead:', error)
    throw error
  }
}

// Exportar funções para uso em outras partes do app
export default {
  calculateMatchScore,
  getRecommendedLeads,
  updateAllMatchScores,
  getTopLawyersForLead
}
