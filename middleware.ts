// middleware.ts
// Proteção de rotas com NextAuth + Rate Limiting

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { apiLimiter, getIP } from './lib/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting para APIs públicas
  if (pathname.startsWith('/api/')) {
    const ip = getIP(request)
    const { success, limit, remaining, reset } = await apiLimiter?.limit(ip) || { success: true, limit: 100, remaining: 100, reset: 0 }

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    // Adicionar headers de rate limit
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    return response
  }

  // Proteção de rotas autenticadas
  const protectedPaths = ['/dashboard', '/cliente', '/advogado', '/chat']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/cliente/:path*',
    '/advogado/:path*',
    '/chat/:path*',
  ],
}
