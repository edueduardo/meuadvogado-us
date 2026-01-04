// =============================================================================
// ENTERPRISE SECURITY MIDDLEWARE - PROTEÇÃO AVANÇADA
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configurações de segurança
const SECURITY_CONFIG = {
  RATE_LIMITS: {
    '/api/auth': { requests: 5, window: 60 * 1000 }, // 5 req/min
    '/api/caso': { requests: 10, window: 60 * 1000 }, // 10 req/min
    '/api/chat': { requests: 30, window: 60 * 1000 }, // 30 req/min
    '/api/stripe': { requests: 5, window: 60 * 1000 }, // 5 req/min
    default: { requests: 100, window: 60 * 1000 } // 100 req/min
  },
  BLOCKED_COUNTRIES: ['CN', 'RU', 'KP', 'IR'], // Bloquear países suspeitos
  MAX_PAYLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  SUSPICIOUS_PATTERNS: [
    /\b(select|insert|update|delete|drop|union|exec|script)\b/i,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ]
};

// Rate limiting avançado
async function checkRateLimit(
  endpoint: string,
  identifier: string,
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const config = SECURITY_CONFIG.RATE_LIMITS[endpoint as keyof typeof SECURITY_CONFIG.RATE_LIMITS] || SECURITY_CONFIG.RATE_LIMITS.default;
  const key = `rate_limit:${endpoint}:${identifier}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(config.window / 1000));
  }
  
  const allowed = current <= config.requests;
  const remaining = Math.max(0, config.requests - current);
  const resetTime = Date.now() + config.window;
  
  // Log de tentativas suspeitas
  if (!allowed) {
    await redis.lpush('suspicious_activity', JSON.stringify({
      type: 'rate_limit_exceeded',
      identifier,
      endpoint,
      ip,
      timestamp: new Date().toISOString()
    }));
    await redis.ltrim('suspicious_activity', 0, 999); // Manter últimos 1000
  }
  
  return { allowed, remaining, resetTime };
}

// Detecção de IP suspeito
async function isSuspiciousIP(ip: string): Promise<boolean> {
  // Verificar se IP está na blacklist
  const blacklisted = await redis.sismember('blacklisted_ips', ip);
  if (blacklisted) return true;
  
  // Verificar tentativas recentes
  const recentAttempts = await redis.incr(`ip_attempts:${ip}`);
  if (recentAttempts === 1) {
    await redis.expire(`ip_attempts:${ip}`, 3600); // 1 hora
  }
  
  return recentAttempts > 100; // Bloquear se >100 tentativas/hora
}

// Análise de User-Agent
function analyzeUserAgent(userAgent: string): { suspicious: boolean; threats: string[] } {
  const threats: string[] = [];
  let suspicious = false;
  
  // Detectar bots e ferramentas suspeitas
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /curl/i,
    /wget/i,
    /python/i,
    /perl/i,
    /java/i,
    /go-http/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      threats.push(`Suspicious user agent pattern: ${pattern}`);
      suspicious = true;
    }
  }
  
  // User-Agent muito curto ou vazio é suspeito
  if (!userAgent || userAgent.length < 10) {
    threats.push('Missing or too short user agent');
    suspicious = true;
  }
  
  return { suspicious, threats };
}

// Validação de payload
function validatePayload(body: string): { valid: boolean; threats: string[] } {
  const threats: string[] = [];
  
  // Verificar tamanho
  if (body.length > SECURITY_CONFIG.MAX_PAYLOAD_SIZE) {
    threats.push('Payload too large');
    return { valid: false, threats };
  }
  
  // Verificar padrões suspeitos
  for (const pattern of SECURITY_CONFIG.SUSPICIOUS_PATTERNS) {
    if (pattern.test(body)) {
      threats.push(`Suspicious pattern detected: ${pattern}`);
    }
  }
  
  // Verificar encoding attacks
  try {
    decodeURIComponent(body);
  } catch {
    threats.push('Invalid encoding detected');
  }
  
  return { valid: threats.length === 0, threats };
}

// Geolocalização (simulada)
async function getCountryFromIP(ip: string): Promise<string> {
  // Na implementação real, usar serviço como MaxMind GeoIP2
  // Por enquanto, simulação baseada em padrões de IP
  if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'BR'; // Local
  }
  return 'US'; // Default
}

// Headers de segurança
function setSecurityHeaders(response: NextResponse): NextResponse {
  // Headers básicos
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers avançados
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.stripe.com"
  );
  
  // Remover headers informativos
  response.headers.set('Server', '');
  response.headers.set('X-Powered-By', '');
  
  return response;
}

// Log de segurança
async function logSecurityEvent(event: string, data: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...data,
    fingerprint: crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16)
  };
  
  await redis.lpush('security_logs', JSON.stringify(logEntry));
  await redis.ltrim('security_logs', 0, 9999); // Manter últimos 10k logs
  
  console.warn('🚨 Security Event:', logEntry);
}

// Middleware principal
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const url = request.url;
  const method = request.method;
  
  try {
    // 1. Verificar IP suspeito
    if (await isSuspiciousIP(ip)) {
      await logSecurityEvent('SUSPICIOUS_IP_BLOCKED', { ip, userAgent, url });
      return new NextResponse('Blocked', { status: 403 });
    }
    
    // 2. Analisar User-Agent
    const uaAnalysis = analyzeUserAgent(userAgent);
    if (uaAnalysis.suspicious) {
      await logSecurityEvent('SUSPICIOUS_USER_AGENT', { 
        ip, 
        userAgent, 
        url, 
        threats: uaAnalysis.threats 
      });
      // Não bloquear ainda, apenas logar
    }
    
    // 3. Verificar geolocalização
    const country = await getCountryFromIP(ip);
    if (SECURITY_CONFIG.BLOCKED_COUNTRIES.includes(country)) {
      await logSecurityEvent('BLOCKED_COUNTRY', { ip, country, url });
      return new NextResponse('Blocked', { status: 403 });
    }
    
    // 4. Rate limiting
    const endpoint = new URL(url).pathname;
    const rateLimitKey = `${ip}:${request.headers.get('authorization')?.substring(0, 20) || 'anonymous'}`;
    const rateCheck = await checkRateLimit(rateLimitKey, endpoint, ip);
    
    if (!rateCheck.allowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        ip, 
        endpoint, 
        key: rateLimitKey,
        userAgent 
      });
      
      const response = new NextResponse('Too Many Requests', { status: 429 });
      response.headers.set('Retry-After', Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString());
      response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.RATE_LIMITS[endpoint as keyof typeof SECURITY_CONFIG.RATE_LIMITS]?.requests.toString() || '100');
      response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateCheck.resetTime.toString());
      
      return setSecurityHeaders(response);
    }
    
    // 5. Validar payload (só para POST/PUT)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = await request.text();
      const payloadCheck = validatePayload(body);
      
      if (!payloadCheck.valid) {
        await logSecurityEvent('MALICIOUS_PAYLOAD', { 
          ip, 
          url, 
          method,
          threats: payloadCheck.threats 
        });
        return new NextResponse('Bad Request', { status: 400 });
      }
    }
    
    // 6. Adicionar headers de segurança à resposta
    const response = NextResponse.next();
    return setSecurityHeaders(response);
    
  } catch (error) {
    await logSecurityEvent('MIDDLEWARE_ERROR', { 
      ip, 
      url, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Em caso de erro no middleware, permitir request mas logar
    return NextResponse.next();
  }
}

// Funções utilitárias
export async function blockIP(ip: string, duration: number = 3600): Promise<void> {
  await redis.sadd('blacklisted_ips', ip);
  await redis.expire(`blacklisted_ips:${ip}`, duration);
}

export async function unblockIP(ip: string): Promise<void> {
  await redis.srem('blacklisted_ips', ip);
}

export async function getSecurityStats(): Promise<any> {
  const logs = await redis.lrange('security_logs', 0, -1);
  const stats: any = {
    totalEvents: logs.length,
    eventsByType: {},
    topBlockedIPs: {},
    recentEvents: logs.slice(-10).map(log => JSON.parse(log))
  };
  
  for (const log of logs) {
    const event = JSON.parse(log);
    stats.eventsByType[event.event] = (stats.eventsByType[event.event] || 0) + 1;
    
    if (event.ip) {
      stats.topBlockedIPs[event.ip] = (stats.topBlockedIPs[event.ip] || 0) + 1;
    }
  }
  
  return stats;
}
