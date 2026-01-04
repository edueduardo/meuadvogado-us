'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Conversation {
  id: string
  status: string
  updatedAt: string
  lawyer?: { user: { name: string } }
  client?: { user: { name: string } }
  messages: Array<{ content: string; createdAt: string }>
  _count: { messages: number }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetchConversations()
    }
  }, [status, router])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  const isLawyer = session?.user?.role === 'LAWYER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LegalAI Chat
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href={isLawyer ? '/advogado/dashboard' : '/cliente/dashboard'}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                ← Dashboard
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{isLawyer ? 'Advogado' : 'Cliente'}</p>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mensagens 💬</h1>
          <p className="text-gray-600">Suas conversas com {isLawyer ? 'clientes' : 'advogados'}</p>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma conversa ainda</h3>
              <p className="text-gray-600 mb-6">
                {isLawyer
                  ? 'Quando você aceitar um lead, poderá conversar com o cliente aqui'
                  : 'Quando um advogado aceitar seu caso, você poderá conversar aqui'}
              </p>
              <Link
                href={isLawyer ? '/advogado/leads' : '/caso'}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {isLawyer ? 'Ver Leads' : 'Criar Caso'}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => {
                const otherUser = isLawyer ? conv.client?.user : conv.lawyer?.user
                const lastMessage = conv.messages[0]

                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className="block p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {otherUser?.name?.charAt(0) || '?'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Usuário'}</h3>
                            {conv.status === 'ACTIVE' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Ativa
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>
                              {new Date(conv.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(conv.updatedAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>{conv._count.messages} mensagens</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
