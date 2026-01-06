import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { lawyer: true },
    });

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Only lawyers can create milestones" }, { status: 403 });
    }

    const { caseId, clientId, title, description, amount, dueDate, order } = await req.json();

    // Validate inputs
    if (!caseId || !clientId || !title || !amount || !order) {
      return NextResponse.json(
        { error: "Missing required fields: caseId, clientId, title, amount, order" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    // Verify case exists and lawyer has access
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        lawyerId: user.lawyer?.id,
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found or unauthorized" }, { status: 404 });
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create milestone (amount comes in cents, e.g. 10000 = $100)
    const milestone = await prisma.milestone.create({
      data: {
        caseId,
        clientId,
        lawyerId: user.lawyer!.id,
        title,
        description,
        amount: Math.round(amount), // Ensure integer cents
        currency: "brl",
        status: "pending",
        order,
        dueDate: dueDate ? new Date(dueDate) : null,
        idempotencyKey: `milestone-${caseId}-${order}-${Date.now()}`,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_MILESTONE",
        resource: "Milestone",
        resourceId: milestone.id,
        details: `Created milestone: ${title} for case ${caseId}`,
        severity: "info",
      },
    });

    return NextResponse.json(
      {
        success: true,
        milestone: {
          id: milestone.id,
          title: milestone.title,
          amount: milestone.amount,
          status: milestone.status,
          order: milestone.order,
          createdAt: milestone.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create milestone error:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
