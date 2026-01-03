// app/api/chat/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let conversations;

    if (user.role === "CLIENT" && user.clientId) {
      conversations = await prisma.conversation.findMany({
        where: { clientId: user.clientId },
        include: {
          lawyer: { include: { user: { select: { name: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else if (user.role === "LAWYER" && user.lawyerId) {
      conversations = await prisma.conversation.findMany({
        where: { lawyerId: user.lawyerId },
        include: {
          client: { include: { user: { select: { name: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { caseId, lawyerId } = await req.json();

    if (!caseId || !lawyerId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        caseId,
        clientId: client.id,
        lawyerId,
        status: "ACTIVE",
      },
      include: {
        lawyer: { include: { user: { select: { name: true } } } },
        client: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 });
  }
}
