// app/api/advogado/stats/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: user.id },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
    }

    // Stats
    const totalLeads = await prisma.case.count({
      where: { matchedLawyerId: lawyer.id },
    });

    const leadsThisMonth = await prisma.case.count({
      where: {
        matchedLawyerId: lawyer.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const avgRating = await prisma.review.aggregate({
      where: { lawyerId: lawyer.id, verified: true },
      _avg: { rating: true },
      _count: true,
    });

    const stats = {
      viewCount: lawyer.viewCount,
      contactCount: lawyer.contactCount,
      totalLeads,
      leadsThisMonth,
      avgRating: avgRating._avg.rating || 0,
      totalReviews: avgRating._count,
      plan: lawyer.plan,
      verified: lawyer.verified,
      featured: lawyer.featured,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching lawyer stats:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
