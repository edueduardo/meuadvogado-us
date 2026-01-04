'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
  lawyer: { user: { name: string } }
  client: { user: { name: string } }
}

export default function ChatConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const conversationId = params?.conversationId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated' && conversationId) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [status, conversationId, router])

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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Enviar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
