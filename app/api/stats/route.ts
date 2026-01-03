// app/api/stats/route.ts
// API de estatísticas reais para a homepage

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
        byStatus: casesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      },
      clients: totalClients,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    
    // Fallback com dados mockados se o banco falhar
    const fallbackStats = {
      lawyers: {
        total: 0,
        verified: 0,
        cities: 0,
        states: 0
      },
      practiceAreas: 0,
      cases: {
        total: 0,
        byStatus: {}
      },
      clients: 0,
      lastUpdated: new Date().toISOString(),
      error: "Database unavailable - showing fallback"
    };

    return NextResponse.json(fallbackStats);
  }
}
