import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all statistics from database
    const [totalLawyers, verifiedLawyers, totalClients, totalCases, activeCases, completedCases, conversations, messages] = await Promise.all([
      prisma.lawyer.count(),
      prisma.lawyer.count({ where: { verified: true } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.case.count(),
      prisma.case.count({ where: { status: 'open' } }),
      prisma.case.count({ where: { status: 'closed' } }),
      prisma.conversation.count(),
      prisma.message.count(),
    ]);

    // Calculate conversion rate
    const leadsToClients = totalCases > 0 ? Math.round(totalClients * (completedCases / totalCases)) : 0;
    const conversionRate = totalCases > 0 ? (leadsToClients / totalCases) * 100 : 0;

    // Get today's messages count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await prisma.message.count({
      where: { createdAt: { gte: today } }
    });

    // Get DAU (Daily Active Users)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dailyActiveUsers = await prisma.user.count({
      where: { lastActiveAt: { gte: yesterday } }
    });

    // Mock revenue data (until Stripe integration is active)
    const totalRevenue = verifiedLawyers * 199 * 0.5; // Assume 50% of lawyers on Professional plan
    const thisMonthRevenue = totalRevenue / 12;
    const activeSubscriptions = Math.round(verifiedLawyers * 0.5);

    // Calculate average response time (mock for now)
    const avgResponseTime = '2h 15m';

    // Mock recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'signup',
        description: `${verifiedLawyers} advogados verificados`,
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'case',
        description: `${completedCases} casos concluídos`,
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'conversion',
        description: `${leadsToClients} leads convertidos em clientes`,
        timestamp: new Date()
      }
    ];

    return NextResponse.json({
      totalLawyers,
      verifiedLawyers,
      totalClients,
      totalCases,
      activeCases,
      completedCases,
      conversions: {
        leadsToClients,
        conversionRate
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        thisMonth: Math.round(thisMonthRevenue * 100) / 100,
        activeSubscriptions
      },
      engagement: {
        dailyActiveUsers,
        chatMessages: todayMessages,
        avgResponseTime
      },
      recentActivity,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
