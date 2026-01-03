// app/api/cliente/casos/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const cases = await prisma.case.findMany({
      where: { clientId: client.id },
      include: {
        practiceArea: true,
        analysis: true,
        matchedLawyer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching client cases:", error);
    return NextResponse.json({ error: "Erro ao buscar casos" }, { status: 500 });
  }
}
