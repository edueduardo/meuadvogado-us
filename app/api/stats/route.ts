// app/api/stats/route.ts
// API de estatísticas reais para a homepage

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Teste de conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    // Contagem real de advogados ativos
    const totalLawyers = await prisma.lawyer.count({
      where: { active: true }
    });

    // Contagem de cidades únicas com advogados
    const uniqueCities = await prisma.lawyer.groupBy({
      by: ['city'],
      where: { active: true },
      _count: true
    });

    // Contagem de áreas de prática
    const totalPracticeAreas = await prisma.practiceArea.count({
      where: { active: true }
    });

    // Contagem de casos reais
    const totalCases = await prisma.case.count();

    // Contagem de advogados verificados
    const verifiedLawyers = await prisma.lawyer.count({
      where: { 
        active: true,
        verified: true 
      }
    });

    // Contagem de clientes
    const totalClients = await prisma.client.count();

    // Casos por status
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      _count: true
    });

    // Advogados por estado
    const lawyersByState = await prisma.lawyer.groupBy({
      by: ['state'],
      where: { active: true },
      _count: true
    });

    const stats = {
      lawyers: {
        total: totalLawyers,
        verified: verifiedLawyers,
        cities: uniqueCities.length,
        states: lawyersByState.length
      },
      practiceAreas: totalPracticeAreas,
      cases: {
        total: totalCases,
        byStatus: casesByStatus.reduce((acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      },
      clients: totalClients,
      lastUpdated: new Date().toISOString(),
      database: "connected"
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    
    // Fallback com dados mockados se o banco falhar
    const fallbackStats = {
      lawyers: {
        total: 6,
        verified: 6,
        cities: 5,
        states: 5
      },
      practiceAreas: 8,
      cases: {
        total: 3,
        byStatus: {
          NEW: 1,
          ANALYZING: 1,
          MATCHED: 1
        }
      },
      clients: 5,
      lastUpdated: new Date().toISOString(),
      database: "fallback - showing demo data",
      error: "Database unavailable - showing demo data"
    };

    return NextResponse.json(fallbackStats);
  }
}
