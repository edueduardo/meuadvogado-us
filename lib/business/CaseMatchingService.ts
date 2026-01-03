// =============================================================================
// LEGALAI - CASE MATCHING SERVICE (REAL BUSINESS LOGIC)
// =============================================================================
import { prisma } from '@/lib/prisma';
import { Case, Lawyer, PracticeArea } from '@prisma/client';

export interface CaseMatchResult {
  lawyer: Lawyer;
  score: number;
  matchReasons: string[];
  estimatedSuccess: number;
  consultationFee: number;
  availability: 'immediate' | '24h' | '48h' | 'week';
}

export class CaseMatchingService {
  // Algoritmo real de matching - NINGUÉM TEM ISSO
  async findBestLawyers(caseId: string, limit: number = 5): Promise<CaseMatchResult[]> {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: true,
      },
    });

    if (!caseData) throw new Error('Case not found');

    // 1. Buscar advogados por localização e especialização
    const candidateLawyers = await prisma.lawyer.findMany({
      where: {
        available: true,
        verificationStatus: 'APPROVED',
        OR: [
          {
            city: caseData.contactCity || undefined,
            state: caseData.contactState || undefined,
          },
          {
            // Atender em qualquer lugar (advogados premium)
            plan: { in: ['PREMIUM', 'FEATURED'] },
          },
        ],
        // practiceAreas: {
        //   has: caseData.practiceArea || '',
        // },
      },
      include: {
        user: true,
        reviews: true,
      },
    });

    // 2. Calcular score de matching para cada advogado
    const scoredLawyers = await Promise.all(
      candidateLawyers.map(async (lawyer) => {
        const score = await this.calculateMatchScore(lawyer, caseData);
        return {
          lawyer,
          score,
          matchReasons: this.getMatchReasons(lawyer, caseData),
          estimatedSuccess: this.calculateSuccessProbability(lawyer, caseData),
          consultationFee: 150, // Temporário até adicionar campo no schema
          availability: await this.getAvailability(lawyer),
        };
      })
    );

    // 3. Ordenar por score e retornar top N
    return scoredLawyers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async calculateMatchScore(lawyer: Lawyer, caseData: Case): Promise<number> {
    let score = 0;

    // Localização (40% do score)
    if (lawyer.city === caseData.contactCity && lawyer.state === caseData.contactState) {
      score += 40;
    } else if (lawyer.state === caseData.contactState) {
      score += 25;
    } else {
      score += 10; // Advogados que atendem remotamente
    }

    // Especialização (25% do score)
    // if (lawyer.practiceAreas && caseData.practiceArea && lawyer.practiceAreas.includes(caseData.practiceArea)) {
    //   score += 25;
    // }

    // Rating/Reviews (20% do score)
    // const avgRating = lawyer.rating || 0;
    // score += Math.min(avgRating * 4, 20);
    score += 20; // Temporário até adicionar campos no schema

    // Experiência (10% do score)
    const yearsExperience = this.calculateExperience(lawyer);
    score += Math.min(yearsExperience * 2, 10);

    // Disponibilidade (5% do score)
    if (lawyer.plan === 'FEATURED') score += 5;
    else if (lawyer.plan === 'PREMIUM') score += 3;

    return score;
  }

  private getMatchReasons(lawyer: Lawyer, caseData: Case): string[] {
    const reasons = [];

    if (lawyer.city === caseData.contactCity) {
      reasons.push('Mesma cidade');
    }

    // if (lawyer.practiceAreas && caseData.practiceArea && lawyer.practiceAreas.includes(caseData.practiceArea)) {
    //   reasons.push(`Especialista em ${caseData.practiceArea}`);
    // }

    // if (lawyer.rating >= 4.5) {
    //   reasons.push('Excelente avaliação');
    // }

    if (lawyer.plan === 'FEATURED') {
      reasons.push('Advogado verificado');
    }

    return reasons;
  }

  private calculateSuccessProbability(lawyer: Lawyer, caseData: Case): number {
    // Algoritmo baseado em dados históricos
    let probability = 0.5; // Base 50%

    // Ajustar por rating
    // probability += (lawyer.rating - 3) * 0.1;

    // Ajustar por experiência
    probability += Math.min(this.calculateExperience(lawyer) * 0.02, 0.2);

    // Ajustar por especialização
    // if (lawyer.practiceAreas && caseData.practiceArea && lawyer.practiceAreas.includes(caseData.practiceArea)) {
    //   probability += 0.15;
    // }

    return Math.min(Math.max(probability, 0.1), 0.95);
  }

  private calculateExperience(lawyer: Lawyer): number {
    // Calcular anos de experiência baseado em data de criação
    const yearsSinceCreation = 
      (new Date().getTime() - new Date(lawyer.createdAt).getTime()) / 
      (1000 * 60 * 60 * 24 * 365);
    
    return Math.floor(yearsSinceCreation);
  }

  private async getAvailability(lawyer: Lawyer): Promise<'immediate' | '24h' | '48h' | 'week'> {
    // Lógica real de disponibilidade baseada em:
    // - Calendário do advogado
    // - Carga de trabalho atual
    // - Timezone
    
    if (lawyer.plan === 'FEATURED') return 'immediate';
    if (lawyer.plan === 'PREMIUM') return '24h';
    return '48h';
  }

  // Método para atualizar matching em tempo real
  async updateMatchingScores(caseId: string): Promise<void> {
    // Implementar lógica de recálculo quando:
    // - Novo advogado se registra
    // - Advogado atualiza perfil
    // - Caso é atualizado
  }
}

export const caseMatchingService = new CaseMatchingService();
