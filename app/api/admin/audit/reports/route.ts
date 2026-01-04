// app/api/admin/audit/reports/route.ts
// API para relatórios de auditoria

import { NextRequest, NextResponse } from "next/server";
import { AuditService } from "@/lib/audit/audit-logs";
import { verifyAdmin } from "@/lib/auth/verify-admin";

export async function GET(req: NextRequest) {
  const authError = await verifyAdmin();
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
