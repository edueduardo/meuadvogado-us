// app/api/lawyers/recent/route.ts
// API para buscar advogados recentes/destaques na homepage

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { 
        active: true,
        verified: true 
      },
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
        { createdAt: "desc" },
      ],
      take: 6, // Apenas 6 para a homepage
    });

    // Calcular rating médio
    const lawyersWithRating = lawyers.map((lawyer: any) => {
      const ratings = lawyer.reviews.map((r: any) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
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
        practiceAreas: lawyer.practiceAreas.map((pa: any) => ({
          name: pa.practiceArea.name,
          slug: pa.practiceArea.slug,
        })),
        rating: avgRating,
        reviewCount: lawyer.reviews.length,
      };
    });

    return NextResponse.json({ lawyers: lawyersWithRating });
  } catch (error) {
    console.error("Recent lawyers API error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar advogados recentes" },
      { status: 500 }
    );
  }
}
