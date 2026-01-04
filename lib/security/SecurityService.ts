// =============================================================================
// LEGALAI - SECURITY SERVICE (SIMPLIFIED VERSION)
// =============================================================================
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  twoFactorEnabled: boolean;
  auditEnabled: boolean;
}

export interface SecurityEvent {
  userId?: string;
  ip: string;
  userAgent: string;
  action: string;
  resource?: string;
  success: boolean;
  riskScore: number;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  type: 'suspicious_login' | 'data_breach' | 'privilege_escalation' | 'data_access' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class SecurityService {
  private config: SecurityConfig = {
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorEnabled: true,
    auditEnabled: true,
  };

  private suspiciousIPs: Set<string> = new Set();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  // Password Security
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`);
    } else {
      score += 20;
    }

    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 20;
    }

    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 20;
    }

    if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 20;
    }

    if (this.config.passwordRequireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    }

    if (this.isCommonPassword(password)) {
      errors.push('Password is too common. Choose a more unique password');
      score = Math.max(0, score - 50);
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(100, score),
    };
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'password1', 'qwerty123', 'admin123'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  // Session Management
  async createSession(userId: string, metadata: {
    ip: string;
    userAgent: string;
    device?: string;
    location?: string;
  }): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.config.sessionTimeout);

    // Temporário - Session model não existe no schema
    // await prisma.session.create({
    //   data: {
    //     id: sessionId,
    //     userId,
    //     expiresAt,
    //     metadata,
    //   },
    // });

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<{
    isValid: boolean;
    userId?: string;
    needsRefresh?: boolean;
  }> {
    // Temporário - implementação básica
    return { isValid: false };
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Temporário - implementação básica
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    // Temporário - implementação básica
  }

  // Rate Limiting
  checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const key = identifier;

    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  // Security Monitoring
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.config.auditEnabled) return;

    // Temporário - AuditLog não tem campo metadata
    // await prisma.auditLog.create({
    //   data: {
    //     userId: event.userId,
    //     action: event.action,
    //     resource: event.resource,
    //     ipAddress: event.ip,
    //     userAgent: event.userAgent,
    //   },
    // });

    await this.analyzeSecurityEvent(event);
  }

  private async analyzeSecurityEvent(event: SecurityEvent): Promise<void> {
    const riskScore = event.riskScore;

    if (riskScore >= 80) {
      await this.createSecurityAlert({
        type: 'suspicious_login',
        severity: 'high',
        message: `High-risk activity detected: ${event.action}`,
        userId: event.userId,
        metadata: event,
        createdAt: new Date(),
      });
    }

    if (event.action === 'login_failed') {
      const recentFailures = await this.getRecentFailedLogins(event.ip);
      if (recentFailures >= this.config.maxLoginAttempts) {
        await this.lockoutIP(event.ip);
        await this.createSecurityAlert({
          type: 'suspicious_login',
          severity: 'medium',
          message: `Multiple failed login attempts from IP: ${event.ip}`,
          metadata: { ip: event.ip, attempts: recentFailures },
          createdAt: new Date(),
        });
      }
    }
  }

  private async getRecentFailedLogins(ip: string): Promise<number> {
    // Temporário - implementação básica
    return 0;
  }

  private async lockoutIP(ip: string): Promise<void> {
    this.suspiciousIPs.add(ip);
    
    setTimeout(() => {
      this.suspiciousIPs.delete(ip);
    }, this.config.lockoutDuration * 60 * 1000);
  }

  isIPSuspicious(ip: string): boolean {
    return this.suspiciousIPs.has(ip);
  }

  private async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Temporário - SecurityAlert não existe no schema
    // await prisma.securityAlert.create({
    //   data: alert,
    // });

    console.error('SECURITY ALERT:', alert);
  }

  // Data Encryption
  encryptSensitiveData(data: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY!;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptSensitiveData(encryptedData: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY!;
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Two-Factor Authentication
  generate2FASecret(userId: string): string {
    const secret = crypto.randomBytes(32).toString('base64');
    
    const encryptedSecret = this.encryptSensitiveData(secret);
    
    // Temporário - twoFactorSecret não existe no schema
    // prisma.user.update({
    //   where: { id: userId },
    //   data: { twoFactorSecret: encryptedSecret },
    // }).catch(console.error);
    
    return secret;
  }

  verify2FAToken(userId: string, token: string): boolean {
    return true; // Placeholder
  }

  // GDPR/Privacy Compliance
  async anonymizeUserData(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.com`,
        name: 'Deleted User',
        phone: null,
        photo: null,
        deletionRequested: true,
        deletionRequestedAt: new Date(),
      },
    });

    await this.logSecurityEvent({
      userId,
      ip: 'system',
      userAgent: 'system',
      action: 'data_anonymization',
      success: true,
      riskScore: 0,
    });
  }

  async exportUserData(userId: string): Promise<Record<string, any>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        lawyer: true,
        client: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const exportData = {
      ...user,
      password: undefined,
    };

    await this.logSecurityEvent({
      userId,
      ip: 'system',
      userAgent: 'system',
      action: 'data_export',
      success: true,
      riskScore: 0,
    });

    return exportData;
  }

  // Configuration Management
  updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Health Check
  async getSecurityHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    activeAlerts: number;
    blockedIPs: number;
    recentEvents: number;
    recommendations: string[];
  }> {
    const activeAlerts = 0; // Temporário
    const blockedIPs = this.suspiciousIPs.size;
    const recentEvents = 0; // Temporário

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    if (activeAlerts > 10) {
      status = 'critical';
      recommendations.push('High number of security alerts - investigate immediately');
    } else if (activeAlerts > 5) {
      status = 'warning';
      recommendations.push('Elevated security alerts - monitor closely');
    }

    if (blockedIPs > 100) {
      status = status === 'critical' ? 'critical' : 'warning';
      recommendations.push('High number of blocked IPs - review attack patterns');
    }

    return {
      status,
      activeAlerts,
      blockedIPs,
      recentEvents,
      recommendations,
    };
  }
}

export const securityService = new SecurityService();
