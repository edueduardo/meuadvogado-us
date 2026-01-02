// app/api/advogados/route.ts
// API para busca e listagem de advogados

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const area = searchParams.get("area");
    const plan = searchParams.get("plan");
    const verified = searchParams.get("verified");

    const where: any = {
      active: true,
    };

    if (city) where.city = city;
    if (state) where.state = state;
    if (verified === "true") where.verified = true;
    if (plan) where.plan = plan;

    if (area) {
      where.practiceAreas = {
        some: {
          practiceArea: {
            slug: area,
          },
        },
      };
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        practiceAreas: {
          include: {
            practiceArea: true,
          },
        },
        reviews: {
          where: { verified: true },
          select: {
            rating: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { plan: "desc" },
        { verified: "desc" },
        { viewCount: "desc" },
      ],
      take: 50,
    });

    // Calcular rating médio
    const lawyersWithRating = lawyers.map((lawyer) => {
      const ratings = lawyer.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return {
        id: lawyer.id,
        name: lawyer.user.name,
        slug: lawyer.slug,
        headline: lawyer.headline,
        city: lawyer.city,
        state: lawyer.state,
        plan: lawyer.plan,
        verified: lawyer.verified,
        featured: lawyer.featured,
        yearsExperience: lawyer.yearsExperience,
        languages: lawyer.languages,
        practiceAreas: lawyer.practiceAreas.map((pa) => ({
          name: pa.practiceArea.name,
          slug: pa.practiceArea.slug,
        })),
        rating: avgRating,
        reviewCount: lawyer.reviews.length,
      };
    });

    return NextResponse.json({ lawyers: lawyersWithRating });
  } catch (error) {
    console.error("Lawyers list error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar advogados" },
      { status: 500 }
    );
  }
}
