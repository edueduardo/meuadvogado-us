// lib/matching.ts
// Algoritmo inteligente de match cliente-advogado
// Score baseado em: localização, área, plano, idioma, urgência

import { prisma } from "./prisma";

export interface MatchCriteria {
  score: number;
  lawyerId: string;
  reasons: string[];
  lawyer?: {
    name: string;
    city: string;
    state: string;
    plan: string;
    verified: boolean;
  };
}

export async function matchLawyersToCase(
  caseId: string
): Promise<MatchCriteria[]> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: { 
      practiceArea: true, 
      analysis: true 
    },
  });

  if (!caseData) {
    throw new Error("Caso não encontrado");
  }

  const lawyers = await prisma.lawyer.findMany({
    where: {
      active: true,
      verified: true,
      practiceAreas: {
        some: {
          practiceAreaId: caseData.practiceAreaId,
        },
      },
    },
    include: {
      practiceAreas: {
        include: {
          practiceArea: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const scored = lawyers.map((lawyer) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. LOCALIZAÇÃO (peso 40 pontos)
    if (caseData.contactState === lawyer.state) {
      score += 30;
      reasons.push("Mesmo estado");
      
      if (caseData.contactCity === lawyer.city) {
        score += 10;
        reasons.push("Mesma cidade");
      }
    }

    // 2. ÁREA DE ATUAÇÃO (peso 30 pontos)
    const hasArea = lawyer.practiceAreas.some(
      (pa) => pa.practiceAreaId === caseData.practiceAreaId
    );
    if (hasArea) {
      score += 30;
      reasons.push("Especialista na área");
    }

    // 3. PLANO (peso 20 pontos) - Advogados pagos têm prioridade
    if (lawyer.plan === "FEATURED") {
      score += 20;
      reasons.push("Advogado destaque");
    } else if (lawyer.plan === "PREMIUM") {
      score += 10;
      reasons.push("Advogado premium");
    }

    // 4. IDIOMA (peso 10 pontos)
    if (lawyer.languages.includes("pt")) {
      score += 10;
      reasons.push("Fala português");
    }

    // 5. URGÊNCIA (bonus de até 15 pontos)
    if (caseData.analysis?.urgency === "CRITICAL") {
      if (lawyer.plan === "FEATURED") {
        score += 15;
        reasons.push("Caso urgente - advogado destaque");
      } else if (lawyer.plan === "PREMIUM") {
        score += 10;
        reasons.push("Caso urgente - advogado premium");
      }
    }

    // 6. TEMPO DE RESPOSTA (bonus de até 10 pontos)
    if (lawyer.responseTime && lawyer.responseTime < 120) {
      score += 10;
      reasons.push("Resposta rápida (média < 2h)");
    } else if (lawyer.responseTime && lawyer.responseTime < 360) {
      score += 5;
      reasons.push("Resposta rápida (média < 6h)");
    }

    // 7. EXPERIÊNCIA (bonus de até 5 pontos)
    if (lawyer.yearsExperience && lawyer.yearsExperience >= 10) {
      score += 5;
      reasons.push("10+ anos de experiência");
    } else if (lawyer.yearsExperience && lawyer.yearsExperience >= 5) {
      score += 3;
      reasons.push("5+ anos de experiência");
    }

    return {
      score,
      lawyerId: lawyer.id,
      reasons,
      lawyer: {
        name: lawyer.user.name,
        city: lawyer.city,
        state: lawyer.state,
        plan: lawyer.plan,
        verified: lawyer.verified,
      },
    };
  });

  // Ordenar por score (maior primeiro)
  return scored.sort((a, b) => b.score - a.score);
}

// Função para distribuir leads baseado no plano
export async function distributeLead(
  caseId: string
): Promise<{
  featured: string[];
  premium: string[];
  free: string[];
}> {
  const matches = await matchLawyersToCase(caseId);

  const featured: string[] = [];
  const premium: string[] = [];
  const free: string[] = [];

  for (const match of matches) {
    if (match.lawyer?.plan === "FEATURED") {
      featured.push(match.lawyerId);
    } else if (match.lawyer?.plan === "PREMIUM") {
      premium.push(match.lawyerId);
    } else {
      free.push(match.lawyerId);
    }
  }

  return {
    featured: featured.slice(0, 3), // Top 3 FEATURED
    premium: premium.slice(0, 5),   // Top 5 PREMIUM
    free: free.slice(0, 10),        // Top 10 FREE
  };
}

// REGRA DE ENVIO:
// - FEATURED: recebem imediatamente
// - PREMIUM: recebem após 2 horas se nenhum FEATURED responder
// - FREE: recebem após 24 horas se nenhum pago responder

export async function notifyLawyers(
  caseId: string,
  tier: "featured" | "premium" | "free"
): Promise<void> {
  const distribution = await distributeLead(caseId);
  
  let lawyersToNotify: string[] = [];
  
  switch (tier) {
    case "featured":
      lawyersToNotify = distribution.featured;
      break;
    case "premium":
      lawyersToNotify = distribution.premium;
      break;
    case "free":
      lawyersToNotify = distribution.free;
      break;
  }

  // TODO: Implementar notificações (email, SMS, push)
  console.log(`Notificando ${lawyersToNotify.length} advogados (${tier})`);
  
  // Atualizar caso com matched lawyer (primeiro da lista)
  if (lawyersToNotify.length > 0) {
    const topMatch = await matchLawyersToCase(caseId);
    if (topMatch.length > 0) {
      await prisma.case.update({
        where: { id: caseId },
        data: {
          matchedLawyerId: topMatch[0].lawyerId,
          matchedAt: new Date(),
          matchScore: topMatch[0].score,
          status: "MATCHED",
        },
      });
    }
  }
}

// Calcular quality score do lead
export function calculateLeadQualityScore(params: {
  descriptionLength: number;
  hasEmail: boolean;
  phoneVerified: boolean;
  hasAdditionalInfo: boolean;
}): number {
  let score = 0;

  // Descrição longa = lead mais sério
  if (params.descriptionLength > 200) {
    score += 20;
  } else if (params.descriptionLength > 100) {
    score += 10;
  }

  // Email fornecido
  if (params.hasEmail) {
    score += 15;
  }

  // Telefone verificado (SMS)
  if (params.phoneVerified) {
    score += 25;
  }

  // Info adicional fornecida
  if (params.hasAdditionalInfo) {
    score += 10;
  }

  // Score base
  score += 30;

  return Math.min(score, 100);
}
