'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Case {
  id: string
  title: string
  status: string
  practiceArea: { name: string }
  analysis?: {
    urgency: string
    successProbability: number
  }
  createdAt: string
  matchedLawyer?: {
    user: { name: string }
  }
}

export default function ClienteDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetchCases()
    }
  }, [status, router])

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cliente/casos')
      const data = await res.json()
      setCases(data.cases || [])
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      ANALYZING: 'bg-yellow-100 text-yellow-800',
      ANALYZED: 'bg-green-100 text-green-800',
      MATCHED: 'bg-purple-100 text-purple-800',
      CONTACTED: 'bg-indigo-100 text-indigo-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: 'Novo',
      ANALYZING: 'Analisando',
      ANALYZED: 'Analisado',
      MATCHED: 'Match Encontrado',
      CONTACTED: 'Contactado',
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Premium */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LegalAI
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/cliente/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/cliente/guia" className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                <span>📘</span> Guia
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-blue-600 transition">
                Mensagens
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Cliente</p>
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
            Bem-vindo, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Acompanhe seus casos e conecte-se com advogados</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Casos</p>
                <p className="text-4xl font-bold mt-2">{cases.length}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Casos Ativos</p>
                <p className="text-4xl font-bold mt-2">
                  {cases.filter(c => !['CLOSED', 'CONVERTED'].includes(c.status)).length}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Advogados Conectados</p>
                <p className="text-4xl font-bold mt-2">
                  {cases.filter(c => c.matchedLawyer).length}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Cases */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Seus Casos</h2>
                  <Link
                    href="/caso"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-lg"
                  >
                    + Novo Caso
                  </Link>
                </div>
              </div>

              {cases.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum caso ainda</h3>
                  <p className="text-gray-600 mb-6">Comece criando seu primeiro caso jurídico</p>
                  <Link
                    href="/caso"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Criar Primeiro Caso
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cases.map((caso) => (
                    <div key={caso.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {caso.title || 'Caso sem título'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caso.status)}`}>
                              {getStatusLabel(caso.status)}
                            </span>
                            {caso.analysis?.urgency === 'HIGH' && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🔥 Urgente
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {caso.practiceArea.name}
                          </p>
                          {caso.matchedLawyer && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Conectado com {caso.matchedLawyer.user.name}</span>
                            </div>
                          )}
                          {caso.analysis?.successProbability && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Probabilidade de sucesso:</span>
                              <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${caso.analysis.successProbability}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{caso.analysis.successProbability}%</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Criado em {new Date(caso.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Link
                          href={`/cliente/casos/${caso.id}`}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guia Promo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl transition border-2 border-transparent hover:border-blue-200">
              <Link href="/cliente/guia">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">📘 Guia do Imigrante</h3>
                <p className="text-sm text-gray-600 mb-4 pr-8">
                  Entenda seus direitos e como funciona a justiça americana. Sem "juridiquês".
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-blue-500">▶️</span> Você não está sozinho
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-blue-500">▶️</span> O sigilo é sagrado
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-blue-500">▶️</span> Como evitar golpes
                  </div>
                </div>
                <span className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Assistir Vídeos →
                </span>
              </Link>
            </div>

            {/* Suporte Rápido */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Precisa de Ajuda?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Nossa equipe de suporte está pronta para te ajudar com qualquer dúvida sobre a plataforma.
              </p>
              <a 
                href="mailto:suporte@meuadvogado.us"
                className="block text-center bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg transition font-medium text-sm"
              >
                Falar com Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
