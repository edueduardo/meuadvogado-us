// app/api/advogado/leads/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { caseMatchingService } from "@/lib/business/CaseMatchingService";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: user.id },
      include: { practiceAreas: { include: { practiceArea: true } } },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
    }

    // 🚨 IMPLEMENTAÇÃO REAL: Usando algoritmo de matching verdadeiro
    // Buscar leads matched OU usar algoritmo real para encontrar melhores matches
    const [directMatches, algorithmMatches] = await Promise.all([
      // Leads já atribuídos diretamente
      prisma.case.findMany({
        where: { matchedLawyerId: lawyer.id },
        include: {
          practiceArea: true,
          analysis: true,
          client: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
        },
      }),
      
      // 🎯 ALGORITMO REAL DE MATCHING
      caseMatchingService.findBestLawyers("medium").then((matches: any) => 
        matches.map((match: any) => ({
          ...match.lawyer,
          // Adicionar informações do caso
          caseInfo: match.matchReasons,
          score: match.score,
          successProbability: match.estimatedSuccess,
        }))
      )
    ]);

    // Combinar resultados e remover duplicados
    const allLeads = [...directMatches];
    
    // Adicionar matches do algoritmo que não estão nos diretos
    algorithmMatches.forEach((match: any) => {
      if (!directMatches.some((lead: any) => lead.id === match.lawyer.id)) {
        allLeads.push({
          ...match.lawyer,
          practiceArea: match.lawyer.practiceAreas?.[0] || null,
          analysis: null,
          client: null,
          // Metadados do matching
          _matchingScore: match.score,
          _matchReasons: match.matchReasons,
          _successProbability: match.estimatedSuccess,
          _consultationFee: match.consultationFee,
        });
      }
    });

    return NextResponse.json({ 
      leads: allLeads.slice(0, 50), // Limitar a 50 resultados
      _meta: {
        totalDirectMatches: directMatches.length,
        totalAlgorithmMatches: algorithmMatches.length,
        algorithmUsed: "CaseMatchingService v1.0",
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Error fetching lawyer leads:", error);
    return NextResponse.json({ error: "Erro ao buscar leads" }, { status: 500 });
  }
}
