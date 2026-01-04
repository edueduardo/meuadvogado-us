// lib/audit/middleware.ts
// Middleware automático de auditoria para Next.js

import { NextRequest, NextResponse } from "next/server";
import { AuditService, AuditAction, AuditResource } from "./audit-logs";

export function auditMiddleware(resource: AuditResource) {
  return async (req: NextRequest, res: NextResponse) => {
    // Extrair informações da requisição
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    
    // Ignorar health checks e estáticos
    if (path.includes('/health') || path.includes('/_next') || path.includes('/favicon')) {
      return res;
    }
    
    // Log da requisição
    await AuditService.log({
      action: AuditAction.API_ACCESS,
      resource,
      resourceId: url.searchParams.get('id') || undefined,
      details: {
        method,
        path,
        query: Object.fromEntries(url.searchParams),
        userAgent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      severity: 'LOW',
      tags: ['api', method.toLowerCase()],
    });
    
    return res;
  };
}

// Wrapper para API routes
export function withAudit(resource: AuditResource, action?: AuditAction) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const req = args[0];
      const res = args[1];
      
      // Log da ação específica
      if (action) {
        await AuditService.log({
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.query.id || req.params.id,
          details: {
            method: req.method,
            path: req.url,
            body: req.body,
          },
          ipAddress: req.ip,
          userAgent: req.headers.get('user-agent'),
          severity: action.includes('FAILED') ? 'MEDIUM' : 'LOW',
        });
      }
      
      return originalMethod.apply(this, args);
    };
  };
}
