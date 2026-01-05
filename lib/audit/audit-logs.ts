// lib/audit/audit-logs.ts
// AUDIT LOGS COMPLETOS - COMPLIANCE E SEGURANÇA ENTERPRISE

import { prisma } from '@/lib/prisma';
import { backgroundJobs } from '@/lib/queues';

export enum AuditAction {
  // Auth
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  
  // Lawyer Actions
  LAWYER_VERIFIED = 'LAWYER_VERIFIED',
  LAWYER_SUSPENDED = 'LAWYER_SUSPENDED',
  LAWYER_PROFILE_UPDATED = 'LAWYER_PROFILE_UPDATED',
  
  // Case Management
  CASE_CREATED = 'CASE_CREATED',
  CASE_UPDATED = 'CASE_UPDATED',
  CASE_DELETED = 'CASE_DELETED',
  CASE_ASSIGNED = 'CASE_ASSIGNED',
  
  // Financial
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  
  // System
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  API_ACCESS = 'API_ACCESS',
  
  // Security
  SECURITY_BREACH = 'SECURITY_BREACH',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
}

export enum AuditResource {
  USER = 'USER',
  LAWYER = 'LAWYER',
  CLIENT = 'CLIENT',
  CASE = 'CASE',
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SYSTEM = 'SYSTEM',
  API = 'API',
}

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags?: string[];
}

export class AuditService {
  /**
   * Registra uma ação de auditoria
   * 1. Salva no banco de dados
   * 2. Envia para background job se for crítico
   * 3. Retorna log criado
   */
  static async log(data: AuditLogData) {
    try {
      // 1. Salvar no banco
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details as any || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          sessionId: data.sessionId,
          severity: data.severity,
          tags: data.tags || [],
          timestamp: new Date(),
        },
      });

      // 2. Se for ação crítica, enviar para background job
      if (data.severity === 'HIGH' || data.severity === 'CRITICAL') {
        await backgroundJobs.addNotificationJob({
          userIds: ['admin'], // TODO: Get admin users
          title: `🚨 ${data.action} - ${data.resource}`,
          message: `Ação crítica detectada: ${data.action} em ${data.resource}`,
          type: 'warning',
        });
      }

      // 3. Log para console/Sentry
      console.log(`[AUDIT] ${data.action} - ${data.resource}`, {
        userId: data.userId,
        severity: data.severity,
        timestamp: new Date().toISOString(),
      });

      return auditLog;
    } catch (error) {
      console.error('Audit log error:', error);
      // Nunca falhar a operação principal por erro de auditoria
      return null;
    }
  }

  /**
   * Busca logs com filtros avançados
   */
  static async getLogs(filters: {
    userId?: string;
    action?: AuditAction;
    resource?: AuditResource;
    resourceId?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.severity) where.severity = filters.severity;

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const total = await prisma.auditLog.count({ where });

    return {
      logs,
      total,
      hasMore: (filters.offset || 0) + logs.length < total,
    };
  }

  /**
   * Gera relatório de auditoria
   */
  static async generateReport(filters: {
    startDate: Date;
    endDate: Date;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Análise dos dados
    const report = {
      period: {
        start: filters.startDate,
        end: filters.endDate,
      },
      summary: {
        totalLogs: logs.length,
        criticalEvents: logs.filter((l: any) => l.severity === 'CRITICAL').length,
        highEvents: logs.filter((l: any) => l.severity === 'HIGH').length,
        mediumEvents: logs.filter((l: any) => l.severity === 'MEDIUM').length,
        lowEvents: logs.filter((l: any) => l.severity === 'LOW').length,
      },
      actionsByFrequency: this.groupBy(logs, 'action'),
      resourcesByFrequency: this.groupBy(logs, 'resource'),
      usersByActivity: this.groupBy(logs, 'userId'),
      timeline: this.generateTimeline(logs, filters.groupBy || 'day'),
    };

    return report;
  }

  /**
   * Limpa logs antigos (retention policy)
   */
  static async cleanup(retentionDays: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleted = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        severity: {
          not: 'CRITICAL', // Nunca deletar logs críticos
        },
      },
    });

    console.log(`🧹 Cleaned ${deleted.count} old audit logs`);
    return deleted.count;
  }

  /**
   * Verifica atividades suspeitas
   */
  static async detectSuspiciousActivity(userId: string) {
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const suspicious = [];

    // Múltiplas tentativas de login falhadas
    const failedLogins = recentLogs.filter((l: any) => l.action === AuditAction.LOGIN_FAILED);
    if (failedLogins.length >= 5) {
      suspicious.push({
        type: 'MULTIPLE_LOGIN_FAILURES',
        count: failedLogins.length,
        severity: 'HIGH',
      });
    }

    // Mudanças de perfil em sequência
    const profileUpdates = recentLogs.filter((l: any) => l.action === AuditAction.LAWYER_PROFILE_UPDATED);
    if (profileUpdates.length >= 3) {
      suspicious.push({
        type: 'EXCESSIVE_PROFILE_CHANGES',
        count: profileUpdates.length,
        severity: 'MEDIUM',
      });
    }

    // Acesso de IPs diferentes
    const uniqueIPs = new Set(recentLogs.map((l: any) => l.ipAddress).filter(Boolean));
    if (uniqueIPs.size >= 3) {
      suspicious.push({
        type: 'MULTIPLE_IP_ACCESS',
        count: uniqueIPs.size,
        severity: 'MEDIUM',
      });
    }

    return suspicious;
  }

  // Métodos auxiliares
  private static groupBy(items: any[], key: string) {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private static generateTimeline(logs: any[], groupBy: string) {
    const timeline: Record<string, number> = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      let key: string = '';
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!timeline[key]) {
        timeline[key] = 0;
      }
      timeline[key]++;
    });
    
    return timeline;
  }
}

// Middleware para logging automático
export function createAuditMiddleware(resource: AuditResource) {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Log da requisição
      AuditService.log({
        userId: req.user?.id,
        action: AuditAction.API_ACCESS,
        resource,
        resourceId: req.params?.id,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        severity: res.statusCode >= 400 ? 'MEDIUM' : 'LOW',
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
}
