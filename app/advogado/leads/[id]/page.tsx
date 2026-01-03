'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Lead {
  id: string
  description: string
  practiceArea: string
  city: string
  state: string
  status: string
  urgency: string
  createdAt: string
  qualityScore: number
  client: {
    user: {
      name: string
      email: string
    }
    phone: string
  }
  aiAnalysis?: {
    summary: string
    urgency: string
    successProbability: number
    suggestedNextSteps: string[]
    requiredDocuments: string[]
  }
}

export default function LeadDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const leadId = params?.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated' && leadId) {
      fetchLead()
    }
  }, [status, leadId, router])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/advogado/leads/${leadId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao buscar lead')
      }

      setLead(data.lead)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lead')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptLead = async () => {
    setAccepting(true)
    try {
      const res = await fetch(`/api/advogado/leads/${leadId}/accept`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao aceitar lead')
      }

      router.push('/chat')
    } catch (err: any) {
      alert(err.message || 'Erro ao aceitar lead')
    } finally {
      setAccepting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lead...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error || 'Lead não encontrado'}</p>
          <Link
            href="/advogado/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    }
    return styles[urgency as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/advogado/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Voltar ao Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(lead.urgency)}`}>
                {lead.urgency}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(lead.qualityScore)} bg-white border-2`}>
                Qualidade: {lead.qualityScore}/100
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{lead.practiceArea}</h1>
                  <p className="text-gray-600">
                    {lead.city}, {lead.state} • Recebido em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição do Caso</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
              </div>

              {/* Client Info */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informações do Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Nome:</span>
                    <p className="font-semibold text-gray-900">{lead.client.user.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-semibold text-gray-900">{lead.client.user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <p className="font-semibold text-gray-900">{lead.client.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {lead.aiAnalysis && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Análise por IA</h2>
                    <p className="text-sm text-gray-600">Insights automáticos sobre o caso</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Resumo</h3>
                    <p className="text-gray-700">{lead.aiAnalysis.summary}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Probabilidade de Sucesso</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                          style={{ width: `${lead.aiAnalysis.successProbability}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-lg text-gray-900">{lead.aiAnalysis.successProbability}%</span>
                    </div>
                  </div>

                  {lead.aiAnalysis.suggestedNextSteps && lead.aiAnalysis.suggestedNextSteps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Próximos Passos Recomendados</h3>
                      <ul className="space-y-2">
                        {lead.aiAnalysis.suggestedNextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lead.aiAnalysis.requiredDocuments && lead.aiAnalysis.requiredDocuments.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Documentos Necessários</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {lead.aiAnalysis.requiredDocuments.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Accept Lead */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Aceitar Lead</h3>
              <button
                onClick={handleAcceptLead}
                disabled={accepting}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-blue-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                {accepting ? 'Aceitando...' : '✅ Aceitar e Iniciar Conversa'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Ao aceitar, você poderá conversar diretamente com o cliente
              </p>
            </div>

            {/* Lead Score */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Score do Lead</h3>
              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${getQualityColor(lead.qualityScore)}`}>
                  {lead.qualityScore}
                </div>
                <p className="text-sm text-gray-600 mt-1">de 100 pontos</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Descrição completa:</span>
                  <span className="font-semibold">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Localização definida:</span>
                  <span className="font-semibold">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Área específica:</span>
                  <span className="font-semibold">✓</span>
                </div>
              </div>
            </div>

            {/* Lead Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informações do Lead</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">ID do Lead:</span>
                  <p className="font-mono font-semibold text-gray-900">{lead.id.slice(0, 8)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Área:</span>
                  <p className="font-semibold text-gray-900">{lead.practiceArea}</p>
                </div>
                <div>
                  <span className="text-gray-600">Localização:</span>
                  <p className="font-semibold text-gray-900">{lead.city}, {lead.state}</p>
                </div>
                <div>
                  <span className="text-gray-600">Recebido em:</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
