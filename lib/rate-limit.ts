import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Criar instância do Redis (só se configurado)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Rate limiters para diferentes endpoints
export const registerLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 cadastros por hora
      analytics: true,
      prefix: 'ratelimit:register',
    })
  : null

export const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 logins por hora
      analytics: true,
      prefix: 'ratelimit:login',
    })
  : null

export const caseLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 d'), // 5 casos por dia
      analytics: true,
      prefix: 'ratelimit:case',
    })
  : null

export const messageLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 d'), // 100 mensagens por dia
      analytics: true,
      prefix: 'ratelimit:message',
    })
  : null

export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests por hora
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null

// Helper para verificar rate limit
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!limiter) {
    // Se não configurado, permitir (dev mode)
    return { success: true, limit: 999, remaining: 999, reset: 0 }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return { success, limit, remaining, reset }
}

// Helper para obter IP do request
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
  return ip
}
