// app/api/health/database/route.ts
// API para verificar saúde do banco de dados

import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database/health-check";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      status: health.connected ? "healthy" : "unhealthy",
      database: health,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown"
    });
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json(
      { 
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
