// app/api/advogado/leads/route.ts
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
      include: { practiceAreas: { include: { practiceArea: true } } },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
    }

    // Buscar leads matched ou na área de atuação do advogado
    const leads = await prisma.case.findMany({
      where: {
        OR: [
          { matchedLawyerId: lawyer.id },
          {
            practiceAreaId: {
              in: lawyer.practiceAreas.map((pa) => pa.practiceAreaId),
            },
            status: { in: ["ANALYZED", "MATCHED"] },
          },
        ],
      },
      include: {
        practiceArea: true,
        analysis: true,
        client: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching lawyer leads:", error);
    return NextResponse.json({ error: "Erro ao buscar leads" }, { status: 500 });
  }
}
