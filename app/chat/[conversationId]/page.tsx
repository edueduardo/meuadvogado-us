'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import WebSocketChat from '@/components/WebSocketChat'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: {
    name: string
    role: string
  }
}

interface Conversation {
  id: string
  status: string
  lawyer: { user: { name: string; isOnline?: boolean } }
  client: { user: { name: string; isOnline?: boolean } }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isOnline?: boolean
}

export default function ChatConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const conversationId = params?.conversationId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [useWebSocket, setUseWebSocket] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated' && conversationId) {
      loadConversation()
    }
  }, [status, conversationId, router])

  const loadConversation = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/chat/conversations/${conversationId}`)
      if (!res.ok) {
        throw new Error('Conversa não encontrada')
      }

      const data = await res.json()
      setConversation(data)

      // Determine other user based on current user role
      const currentUserRole = session?.user?.role
      let other: User | null = null

      if (currentUserRole === 'CLIENT' && data.lawyer) {
        other = {
          id: data.lawyer.id,
          name: data.lawyer.user.name,
          email: data.lawyer.user.email || '',
          role: data.lawyer.user.role,
          isOnline: data.lawyer.user.isOnline,
        }
      } else if (currentUserRole === 'LAWYER' && data.client) {
        other = {
          id: data.client.id,
          name: data.client.user.name,
          email: data.client.user.email || '',
          role: data.client.user.role,
          isOnline: data.client.user.isOnline,
        }
      }

      setOtherUser(other)
    } catch (error: any) {
      console.error('Error loading conversation:', error)
      setError(error.message || 'Erro ao carregar conversa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      const data = await res.json()
      
      if (res.ok) {
        setMessages(data.messages || [])
        if (data.conversation) {
          setConversation(data.conversation)
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }

      setNewMessage('')
      fetchMessages()
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  const isLawyer = session?.user?.role === 'LAWYER'
  const otherUser = isLawyer ? conversation?.client?.user : conversation?.lawyer?.user

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/chat"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                ← Voltar
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                  {otherUser?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{otherUser?.name || 'Usuário'}</h1>
                  <p className="text-xs text-gray-500">{isLawyer ? 'Cliente' : 'Advogado'}</p>
                </div>
              </div>
            </div>
            {conversation?.status === 'ACTIVE' && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ativa
              </span>
            )}
          </div>
        </div>
      </header>

      {/* WebSocket Chat or Fallback */}
      {useWebSocket && otherUser ? (
        <div className="flex-1 flex flex-col">
          <WebSocketChat
            conversationId={conversationId}
            currentUserId={session?.user?.id || ''}
            otherUser={otherUser}
          />
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Nenhuma mensagem ainda</p>
                  <p className="text-sm text-gray-500 mt-1">Envie a primeira mensagem para iniciar a conversa</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMyMessage = message.senderId === session?.user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isMyMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 px-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <form onSubmit={handleSendMessage} className="flex items-end gap-4">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>)
      }

      {/* Toggle WebSocket */}
      <div className="border-t border-gray-200 bg-white px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useWebSocket}
              onChange={(e) => setUseWebSocket(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Chat em tempo real (WebSocket)</span>
          </label>
          {useWebSocket && (
            <span className="text-xs text-green-600">● Conectado</span>
          )}
        </div>
      </div>
    </div>
  )
}
