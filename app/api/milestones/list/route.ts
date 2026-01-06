import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        lawyer: true,
        client: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get caseId from query params
    const caseId = req.nextUrl.searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId query parameter" }, { status: 400 });
    }

    // Verify user has access to this case
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        OR: [
          { clientId: user.client?.id },
          { lawyerId: user.lawyer?.id },
        ],
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found or unauthorized" }, { status: 404 });
    }

    // Get all milestones for this case
    const milestones = await prisma.milestone.findMany({
      where: { caseId },
      include: {
        lawyer: {
          select: {
            id: true,
            slug: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Calculate stats
    const stats = {
      total: milestones.length,
      pending: milestones.filter((m: any) => m.status === "pending").length,
      funded: milestones.filter((m: any) => m.status === "funded").length,
      completed: milestones.filter((m: any) => m.status === "completed").length,
      released: milestones.filter((m: any) => m.status === "released").length,
      refunded: milestones.filter((m: any) => m.status === "refunded").length,
      totalAmount: milestones.reduce((sum: number, m: any) => sum + m.amount, 0),
      fundedAmount: milestones
        .filter((m: any) => ["funded", "completed", "released"].includes(m.status))
        .reduce((sum: number, m: any) => sum + m.amount, 0),
    };

    return NextResponse.json(
      {
        success: true,
        milestones,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List milestones error:", error);
    return NextResponse.json({ error: "Failed to list milestones" }, { status: 500 });
  }
}
