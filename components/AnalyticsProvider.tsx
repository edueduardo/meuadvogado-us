'use client'

// components/AnalyticsProvider.tsx
// Provider para inicializar e gerenciar analytics

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { analytics, AnalyticsEvents, identifyUser } from '@/lib/analytics/analytics-service'

export default function AnalyticsProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // Inicializar analytics
  useEffect(() => {
    analytics.init()
  }, [])

  // Identificar usuário quando logado
  useEffect(() => {
    if (session?.user) {
      identifyUser(session.user.id, {
        $email: session.user.email || undefined,
        $name: session.user.name || undefined,
        role: session.user.role as any,
      })
    }
  }, [session])

  // Track page views
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Mapear pathname para nome da página
    const pageName = getPageName(pathname)
    
    analytics.track(AnalyticsEvents.PAGE_VIEW, {
      page: pageName,
      path: pathname,
      url,
    })
  }, [pathname, searchParams])

  return <>{children}</>
}

// Helper para obter nome da página
function getPageName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/cliente': 'Cliente Landing',
    '/advogado': 'Advogado Landing',
    '/advogados': 'Buscar Advogados',
    '/caso': 'Novo Caso',
    '/login': 'Login',
    '/cadastro': 'Cadastro',
    '/blog': 'Blog',
    '/como-funciona': 'Como Funciona',
  }

  // Match exato
  if (routes[pathname]) {
    return routes[pathname]
  }

  // Match por prefixo
  if (pathname.startsWith('/advogado/dashboard')) return 'Dashboard Advogado'
  if (pathname.startsWith('/cliente/dashboard')) return 'Dashboard Cliente'
  if (pathname.startsWith('/blog/')) return 'Blog Post'
  if (pathname.startsWith('/advogados/')) return 'Perfil Advogado'
  if (pathname.startsWith('/chat/')) return 'Chat'

  return pathname
}
