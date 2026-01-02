import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // TODO: Implementar autenticação e pegar ID do usuário logado
    const userId = 'temp-user-id'; // Substituir com ID real do usuário

    // Buscar perfil do advogado
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
            verified: true,
          },
        },
        leads: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            message: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer profile not found' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const leadsThisMonth = lawyer.leads.filter(
      (lead) => new Date(lead.createdAt) >= startOfMonth
    ).length;

    const leadsThisWeek = lawyer.leads.filter(
      (lead) => new Date(lead.createdAt) >= startOfWeek
    ).length;

    const leadsToday = lawyer.leads.filter(
      (lead) => new Date(lead.createdAt) >= startOfDay
    ).length;

    // TODO: Implementar sistema de views quando tiver analytics
    const viewsToday = Math.floor(Math.random() * 50) + 10;
    const viewsThisWeek = Math.floor(Math.random() * 200) + 50;
    const viewsThisMonth = Math.floor(Math.random() * 1000) + 200;

    const dashboardData = {
      lawyer: {
        user: lawyer.user,
        views: viewsThisMonth,
        leadsThisMonth,
        totalLeads: lawyer.leads.length,
      },
      recentLeads: lawyer.leads.slice(0, 5),
      stats: {
        viewsToday,
        viewsThisWeek,
        viewsThisMonth,
        leadsToday,
        leadsThisWeek,
        leadsThisMonth,
      },
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
