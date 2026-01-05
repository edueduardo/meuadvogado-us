// app/api/advogado/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRecommendedLeads } from '@/lib/matching-algorithm';
import { getCurrentUser } from "@/lib/session";
import { caseMatchingService } from "@/lib/business/CaseMatchingService";

export async function GET(req: NextRequest) {
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

    // Verificar se é requisição de leads recomendados
    const { searchParams } = new URL(req.url)
    const recommended = searchParams.get('recommended') === 'true'

    if (recommended) {
      // 🎯 BUSCAR LEADS RECOMENDADOS COM ALGORITMO DE MATCHING
      try {
        const recommendedLeads = await getRecommendedLeads(lawyer.id, 10)
        
        // Buscar dados completos dos leads recomendados
        const leadIds = recommendedLeads.map(r => r.leadId)
        const leadsData = await prisma.case.findMany({
          where: { id: { in: leadIds } },
          include: {
            practiceArea: true,
            analysis: true,
            client: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        })

        // Combinar dados com scores
        const leadsWithScores = leadsData.map((lead: any) => {
          const matchData = recommendedLeads.find((r: any) => r.leadId === lead.id)
          return {
            ...lead,
            _matchingScore: matchData?.score || 0,
            _recommendation: matchData?.recommendation || 'LOW',
            _factors: matchData?.factors || null
          }
        })

        return NextResponse.json({ 
          leads: leadsWithScores,
          recommended: true,
          _meta: {
            algorithm: 'MatchingAlgorithm v2.0',
            totalRecommended: recommendedLeads.length,
            timestamp: new Date().toISOString(),
          }
        });
      } catch (error) {
        console.error("Error getting recommended leads:", error);
        // Fallback para leads normais se algoritmo falhar
      }
    }

    // 🚨 IMPLEMENTAÇÃO NORMAL: Leads disponíveis
    const leads = await prisma.case.findMany({
      where: { 
        status: 'NEW',
        // TODO: Adicionar filtros de prática do advogado
      },
      include: {
        practiceArea: true,
        analysis: true,
        client: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Adicionar score básico para todos os leads
    const leadsWithBasicScore = leads.map((lead: any) => ({
      ...lead,
      _matchingScore: lead.analysis?.successProbability || 50,
      _recommendation: 'MEDIUM' as const,
      _factors: null
    }));

    return NextResponse.json({ 
      leads: leadsWithBasicScore,
      recommended: false,
      _meta: {
        algorithm: 'Basic Analysis',
        totalLeads: leads.length,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Error fetching lawyer leads:", error);
    return NextResponse.json({ error: "Erro ao buscar leads" }, { status: 500 });
  }
}
