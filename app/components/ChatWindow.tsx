// app/components/ChatWindow.tsx
// Componente de Chat em Tempo Real

'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/lib/hooks/useChat'
import { Send, Loader, AlertCircle, CheckCheck } from 'lucide-react'

interface ChatWindowProps {
  conversationId: string
  conversationName: string
}

export function ChatWindow({ conversationId, conversationName }: ChatWindowProps) {
  const {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    setTyping,
    markAsRead,
  } = useChat(conversationId)

  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Marcar como lido quando entrar
  useEffect(() => {
    if (isConnected && !isLoading) {
      markAsRead()
    }
  }, [isConnected, isLoading, markAsRead])

  // Typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      setTyping(true)
    }

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Parar de digitar após 3 segundos sem atividade
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTyping(false)
    }, 3000)
  }

  // Enviar mensagem
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || !isConnected) return

    sendMessage(messageInput)
    setMessageInput('')
    setIsTyping(false)
    setTyping(false)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{conversationName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Usuários Online */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{onlineUsers.length} online</span>
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map(user => (
                  <div
                    key={user.userId}
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                    title={user.userName}
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.id === 'current-user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-semibold mb-1">{message.sender.name}</p>
                <p className="text-sm break-words">{message.content}</p>
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  message.sender.id === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span>{new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                  {message.read && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUsers.map(u => u.userName).join(', ')} está digitando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !messageInput.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
