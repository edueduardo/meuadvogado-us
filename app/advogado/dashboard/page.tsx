'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  viewCount: number
  contactCount: number
  totalLeads: number
  leadsThisMonth: number
  avgRating: number
  totalReviews: number
  plan: string
  verified: boolean
  featured: boolean
}

interface Lead {
  id: string
  title: string
  status: string
  practiceArea: { name: string }
  contactCity: string
  contactState: string
  analysis?: {
    urgency: string
    successProbability: number
  }
  createdAt: string
  qualityScore: number
}

interface LeadMatch {
  id: string
  status: 'ACTIVE' | 'CONVERTED' | 'DECLINED' | 'EXPIRED'
  matchedAt: string
  respondedAt?: string
  convertedAt?: string
  matchScore: number
  case: {
    id: string
    title: string
    status: string
    practiceArea: { name: string }
    client?: {
      user: { name: string; email: string }
    }
  }
  conversationId?: string
}

export default function AdvogadoDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [matches, setMatches] = useState<LeadMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [statsRes, leadsRes, matchesRes] = await Promise.all([
        fetch('/api/advogado/stats'),
        fetch('/api/advogado/leads'),
        fetch('/api/advogado/matches'),
      ])
      const statsData = await statsRes.json()
      const leadsData = await leadsRes.json()
      const matchesData = await matchesRes.json()
      setStats(statsData.stats)
      setLeads(leadsData.leads || [])
      setMatches(matchesData.matches || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const getPlanBadge = (plan: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      FREE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Gratuito' },
      PREMIUM: { bg: 'bg-blue-100', text: 'text-blue-800', label: '⭐ Premium' },
      FEATURED: { bg: 'bg-purple-100', text: 'text-purple-800', label: '👑 Destaque' },
    }
    return badges[plan] || badges.FREE
  }

  const planBadge = stats ? getPlanBadge(stats.plan) : getPlanBadge('FREE')

  const MatchStatusBadge = ({ status }: { status: string }) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🔄 Ativo' },
      CONVERTED: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Convertido' },
      DECLINED: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Recusado' },
      EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⏰ Expirado' },
    }
    const badge = badges[status] || badges.ACTIVE
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Premium */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LegalAI Pro
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/advogado/dashboard" className="text-indigo-600 font-medium">
                Dashboard
              </Link>
              <Link href="/advogado/leads" className="text-gray-600 hover:text-indigo-600 transition">
                Leads
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-indigo-600 transition">
                Chat
              </Link>
              <Link href="/advogado/perfil" className="text-gray-600 hover:text-indigo-600 transition">
                Perfil
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${planBadge.bg} ${planBadge.text}`}>
                    {planBadge.label}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo, Dr(a). {session?.user?.name?.split(' ')[0]}! 👨‍⚖️
          </h1>
          <p className="text-gray-600">Gerencie seus leads e expanda sua prática jurídica</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Visualizações</p>
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.viewCount || 0}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% este mês</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Leads Total</p>
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalLeads || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.leadsThisMonth || 0} este mês</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Contatos</p>
              <div className="bg-purple-100 rounded-full p-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.contactCount || 0}</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% este mês</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Avaliação</p>
              <div className="bg-yellow-100 rounded-full p-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.avgRating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.totalReviews || 0} avaliações</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leads Recentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Leads Recentes</h2>
                  <Link href="/advogado/leads" className="text-indigo-600 text-sm hover:underline font-medium">
                    Ver todos →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {leads.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum lead ainda</h3>
                    <p className="text-gray-600">Leads aparecerão aqui quando clientes procurarem sua área</p>
                  </div>
                ) : (
                  leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{lead.title || 'Lead sem título'}</h3>
                            {lead.analysis?.urgency === 'HIGH' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🔥 Urgente
                              </span>
                            )}
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Score: {lead.qualityScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {lead.practiceArea.name} • {lead.contactCity}, {lead.contactState}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Link
                          href={`/advogado/leads/${lead.id}`}
                          className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                        >
                          Ver Lead
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Meus Matches - Leads Aceitos */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">🎯 Meus Leads Aceitos</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {matches.length} matches
                    </span>
                    {matches.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {matches.filter(m => m.status === 'CONVERTED').length} convertidos
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {matches.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum lead aceito ainda</h3>
                    <p className="text-gray-600">Aceite leads disponíveis para começar a conversar</p>
                  </div>
                ) : (
                  matches.slice(0, 5).map((match) => (
                    <div key={match.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{match.case.title}</h3>
                            <MatchStatusBadge status={match.status} />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Score: {match.matchScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {match.case.practiceArea?.name} • Cliente: {match.case.client?.user.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Aceito em {new Date(match.matchedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(match.matchedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {match.convertedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              ✅ Convertido em {new Date(match.convertedAt).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {match.conversationId && (
                            <Link
                              href={`/chat/${match.conversationId}`}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium text-center"
                            >
                              💬 Chat
                            </Link>
                          )}
                          <Link
                            href={`/advogado/leads/${match.case.id}`}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium text-center"
                          >
                            Ver Detalhes
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plano Atual */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Plano</h3>
              <div className={`${planBadge.bg} rounded-xl p-4 mb-4`}>
                <div className={`font-bold text-lg ${planBadge.text}`}>{planBadge.label}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {stats?.plan === 'FREE' && '$0/mês'}
                  {stats?.plan === 'PREMIUM' && '$149/mês'}
                  {stats?.plan === 'FEATURED' && '$299/mês'}
                </div>
              </div>
              {stats?.plan === 'FREE' && (
                <Link
                  href="/advogado/planos"
                  className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium shadow-lg"
                >
                  Fazer Upgrade 🚀
                </Link>
              )}
              {stats?.plan !== 'FREE' && (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">✅ Leads ilimitados</p>
                  <p className="mb-2">✅ Perfil destacado</p>
                  <p>✅ Analytics avançado</p>
                </div>
              )}
            </div>

            {/* Verificação */}
            {!stats?.verified && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Verificação Pendente</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete sua verificação para receber mais leads
                </p>
                <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition font-medium">
                  Verificar Agora
                </button>
              </div>
            )}

            {/* Dica do Dia */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">💡 Dica do Dia</h3>
              <p className="text-sm text-indigo-100">
                Advogados que respondem em até 2 horas recebem 3x mais conversões!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
