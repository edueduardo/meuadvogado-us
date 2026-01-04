// lib/database/health-check.ts
// Verificação de saúde do banco de dados com fallback inteligente

import { prisma } from '@/lib/prisma';

export interface DatabaseHealth {
  connected: boolean;
  error?: string;
  responseTime?: number;
  fallbackUsed: boolean;
  demoData?: {
    lawyers: number;
    cities: number;
    practiceAreas: number;
    cases: number;
    clients: number;
  };
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      connected: true,
      responseTime,
      fallbackUsed: false,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      fallbackUsed: true,
      demoData: {
        lawyers: 6,
        cities: 5,
        practiceAreas: 8,
        cases: 3,
        clients: 5,
      }
    };
  }
}

export async function getDatabaseStats() {
  const health = await checkDatabaseHealth();
  
  if (!health.connected) {
    return {
      lawyers: {
        total: health.demoData?.lawyers || 6,
        verified: health.demoData?.lawyers || 6,
        cities: health.demoData?.cities || 5,
        states: 5
      },
      practiceAreas: health.demoData?.practiceAreas || 8,
      cases: {
        total: health.demoData?.cases || 3,
        byStatus: {
          NEW: 1,
          ANALYZING: 1,
          MATCHED: 1
        }
      },
      clients: health.demoData?.clients || 5,
      lastUpdated: new Date().toISOString(),
      database: "fallback - showing demo data",
      health
    };
  }
  
  try {
    const totalLawyers = await prisma.lawyer.count({ where: { active: true } });
    const uniqueCities = await prisma.lawyer.groupBy({ by: ['city'], where: { active: true }, _count: true });
    const totalPracticeAreas = await prisma.practiceArea.count({ where: { active: true } });
    const totalCases = await prisma.case.count();
    const verifiedLawyers = await prisma.lawyer.count({ where: { active: true, verified: true } });
    const totalClients = await prisma.client.count();
    const casesByStatus = await prisma.case.groupBy({ by: ['status'], _count: true });
    const lawyersByState = await prisma.lawyer.groupBy({ by: ['state'], where: { active: true }, _count: true });

    return {
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
      lastUpdated: new Date().toISOString(),
      database: "connected",
      health
    };
  } catch (error) {
    console.error('Error fetching database stats:', error);
    
    return {
      lawyers: {
        total: health.demoData?.lawyers || 6,
        verified: health.demoData?.lawyers || 6,
        cities: health.demoData?.cities || 5,
        states: 5
      },
      practiceAreas: health.demoData?.practiceAreas || 8,
      cases: {
        total: health.demoData?.cases || 3,
        byStatus: {
          NEW: 1,
          ANALYZING: 1,
          MATCHED: 1
        }
      },
      clients: health.demoData?.clients || 5,
      lastUpdated: new Date().toISOString(),
      database: "error - showing demo data",
      health: {
        ...health,
        error: error instanceof Error ? error.message : 'Stats fetch error'
      }
    };
  }
}
