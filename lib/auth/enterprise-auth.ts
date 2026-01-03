// =============================================================================
// ENTERPRISE AUTHENTICATION SYSTEM - SEGURANÇA MÁXIMA
// =============================================================================
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { prisma } from "@/lib/prisma";
import Redis from 'ioredis';

// Redis para rate limiting e sessões
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configurações de segurança
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_ATTEMPTS: 10,
};

// Rate limiting
async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `auth_rate_limit:${identifier}`;
  const attempts = await redis.incr(key);
  
  if (attempts === 1) {
    await redis.expire(key, Math.ceil(SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000));
  }
  
  return attempts <= SECURITY_CONFIG.RATE_LIMIT_MAX_ATTEMPTS;
}

// Verificar conta bloqueada
async function isAccountLocked(email: string): Promise<boolean> {
  const lockKey = `account_locked:${email}`;
  const locked = await redis.get(lockKey);
  return locked !== null;
}

// Bloquear conta temporariamente
async function lockAccount(email: string): Promise<void> {
  const lockKey = `account_locked:${email}`;
  await redis.setex(lockKey, Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION / 1000), '1');
}

// Registrar tentativa de login
async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const key = `login_attempts:${email}`;
  const attempts = await redis.incr(key);
  
  if (!success) {
    if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      await lockAccount(email);
    }
    await redis.expire(key, Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION / 1000));
  } else {
    await redis.del(key);
  }
}

// Gerar tokens seguros
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { 
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { 
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// 2FA com TOTP (simulado para exemplo)
async function verify2FA(userId: string, token: string): Promise<boolean> {
  // Na implementação real, usar speakeasy ou similar
  const user2FA = await prisma.user2FA.findUnique({
    where: { userId }
  });
  
  if (!user2FA?.enabled) {
    return true; // 2FA não configurado, permite
  }
  
  // Simulação - verificar token TOTP real aqui
  return token === '123456'; // Apenas para demo
}

// Auditoria de segurança
async function logSecurityEvent(event: string, userId: string, metadata: any = {}) {
  await prisma.securityLog.create({
    data: {
      event,
      userId,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
      timestamp: new Date(),
      metadata: JSON.stringify(metadata)
    }
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const clientIP = 'unknown'; // Obter do req.headers['x-forwarded-for']
        
        // Rate limiting
        const rateLimitOk = await checkRateLimit(credentials.email);
        if (!rateLimitOk) {
          await logSecurityEvent('RATE_LIMIT_EXCEEDED', '', { email: credentials.email, ip: clientIP });
          throw new Error("Muitas tentativas. Tente novamente mais tarde.");
        }

        // Verificar conta bloqueada
        const locked = await isAccountLocked(credentials.email);
        if (locked) {
          await logSecurityEvent('LOGIN_BLOCKED', '', { email: credentials.email, ip: clientIP });
          throw new Error("Conta temporariamente bloqueada por segurança.");
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            lawyer: true,
            client: true,
            securitySettings: true
          },
        });

        if (!user) {
          await recordLoginAttempt(credentials.email, false);
          await logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', '', { email: credentials.email, ip: clientIP });
          throw new Error("Credenciais inválidas");
        }

        if (!user.isActive) {
          await logSecurityEvent('LOGIN_FAILED_INACTIVE', user.id, { ip: clientIP });
          throw new Error("Conta desativada");
        }

        // Verificar senha
        const passwordValid = await compare(credentials.password, user.password || '');
        if (!passwordValid) {
          await recordLoginAttempt(credentials.email, false);
          await logSecurityEvent('LOGIN_FAILED_INVALID_PASSWORD', user.id, { ip: clientIP });
          throw new Error("Credenciais inválidas");
        }

        // Verificar 2FA
        const twoFactorValid = await verify2FA(user.id, credentials.twoFactorCode || '');
        if (!twoFactorValid) {
          await logSecurityEvent('LOGIN_FAILED_2FA', user.id, { ip: clientIP });
          throw new Error("Código 2FA inválido");
        }

        // Login bem-sucedido
        await recordLoginAttempt(credentials.email, true);
        await logSecurityEvent('LOGIN_SUCCESS', user.id, { ip: clientIP });

        // Atualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lawyerId: user.lawyer?.id,
          clientId: user.client?.id,
          twoFactorEnabled: user.securitySettings?.twoFactorEnabled || false
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lawyerId = user.lawyerId;
        token.clientId = user.clientId;
        token.twoFactorEnabled = user.twoFactorEnabled;
        
        // Adicionar tokens customizados
        const customTokens = generateTokens(user.id);
        token.accessToken = customTokens.accessToken;
        token.refreshToken = customTokens.refreshToken;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.lawyerId = token.lawyerId as string | undefined;
        session.user.clientId = token.clientId as string | undefined;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
    signUp: "/cadastro",
    signOut: "/",
    error: "/login",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user"
  },
  
  session: {
    strategy: "jwt",
    maxAge: SECURITY_CONFIG.SESSION_TIMEOUT,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Eventos de segurança
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        await logSecurityEvent('NEW_USER_REGISTERED', user.id, { provider: account?.provider });
      }
    },
    async signOut({ session }) {
      await logSecurityEvent('USER_LOGOUT', session.user.id);
    }
  }
};

// Middleware de segurança adicional
export async function validateSession(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    // Verificar se token não foi revogado
    const revoked = await redis.get(`revoked_token:${token}`);
    if (revoked) {
      throw new Error('Token revogado');
    }
    
    // Buscar usuário atualizado
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        lawyer: true,
        client: true,
        securitySettings: true
      }
    });
    
    if (!user || !user.isActive) {
      throw new Error('Usuário inválido');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lawyerId: user.lawyer?.id,
      clientId: user.client?.id,
      twoFactorEnabled: user.securitySettings?.twoFactorEnabled || false
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// Revogar token
export async function revokeToken(token: string): Promise<void> {
  const decoded = jwt.decode(token) as any;
  if (decoded && decoded.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`revoked_token:${token}`, ttl, '1');
    }
  }
}

// Refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(refreshToken, process.env.NEXTAUTH_SECRET!) as any;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Gerar novo access token
    const newAccessToken = jwt.sign(
      { 
        userId: decoded.userId,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '15m' }
    );
    
    return newAccessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
