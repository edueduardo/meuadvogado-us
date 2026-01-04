// app/api/admin/audit/reports/route.ts
// API para relatórios de auditoria

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuditService } from "@/lib/audit/audit-logs";

// Apenas admin pode acessar
async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // TODO: Verificar se user é admin
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = new Date(searchParams.get('startDate')!);
    const endDate = new Date(searchParams.get('endDate')!);
    const groupBy = searchParams.get('groupBy') as 'day' | 'week' | 'month' || 'day';
    
    const report = await AuditService.generateReport({
      startDate,
      endDate,
      groupBy,
    });
    
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Audit report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
