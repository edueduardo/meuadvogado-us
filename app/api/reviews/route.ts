// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lawyerId = searchParams.get("lawyerId");

    if (!lawyerId) {
      return NextResponse.json({ error: "ID do advogado obrigatório" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { lawyerId, verified: true },
      include: {
        client: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { lawyerId, rating, title, comment } = await req.json();

    if (!lawyerId || !rating) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação deve ser entre 1 e 5" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        clientId_lawyerId: {
          clientId: client.id,
          lawyerId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Você já avaliou este advogado" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        clientId: client.id,
        lawyerId,
        rating,
        title,
        comment,
        verified: false,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 });
  }
}
