// app/api/admin/queues/status/route.ts
// API para monitorar status das filas de background jobs

import { NextResponse } from "next/server";
import { backgroundJobs } from "@/lib/queues";

export async function GET() {
  try {
    const status = await backgroundJobs.getQueueStatus();
    
    return NextResponse.json({
      success: true,
      queues: status,
      timestamp: new Date().toISOString(),
      summary: {
        totalQueues: Object.keys(status).length,
        totalWaiting: Object.values(status).reduce((sum, q) => sum + q.waiting, 0),
        totalActive: Object.values(status).reduce((sum, q) => sum + q.active, 0),
        totalCompleted: Object.values(status).reduce((sum, q) => sum + q.completed, 0),
        totalFailed: Object.values(status).reduce((sum, q) => sum + q.failed, 0),
      }
    });
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar status das filas" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await backgroundJobs.clearAllQueues();
    
    return NextResponse.json({
      success: true,
      message: "Todas as filas foram limpas"
    });
  } catch (error) {
    console.error("Queue clear error:", error);
    return NextResponse.json(
      { error: "Erro ao limpar filas" },
      { status: 500 }
    );
  }
}
