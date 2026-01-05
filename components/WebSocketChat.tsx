'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react'
import { useSocket, ChatMessage, TypingUser, OnlineUser } from '@/lib/socket-client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WebSocketChatProps {
  conversationId: string
  currentUserId: string
  otherUser: {
    id: string
    name: string
    role: string
    avatar?: string
    isOnline?: boolean
  }
}

export default function WebSocketChat({
  conversationId,
  currentUserId,
  otherUser,
}: WebSocketChatProps) {
  const { socket, isConnected, sendMessage, startTyping, stopTyping, markAsRead } = useSocket()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isOnline, setIsOnline] = useState(otherUser.isOnline || false)
  const [isLoading, setIsLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Join conversation and setup listeners
  useEffect(() => {
    if (!isConnected || !conversationId) return

    // Join conversation room
    socket.joinConversation(conversationId)

    // Setup event listeners
    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
      
      // Mark message as read if it's from other user
      if (message.sender.id !== currentUserId) {
        markAsRead({
          conversationId,
          messageIds: [message.id],
        })
      }
    }

    const handleConversationHistory = (data: { conversationId: string; messages: ChatMessage[] }) => {
      if (data.conversationId === conversationId) {
        setMessages(data.messages)
        setIsLoading(false)
      }
    }

    const handleUserTyping = (typingUser: TypingUser) => {
      if (typingUser.conversationId === conversationId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== typingUser.userId)
          if (typingUser.isTyping) {
            return [...filtered, typingUser]
          }
          return filtered
        })
      }
    }

    const handleUserOnline = (user: OnlineUser) => {
      if (user.userId === otherUser.id) {
        setIsOnline(true)
      }
    }

    const handleUserOffline = (user: OnlineUser) => {
      if (user.userId === otherUser.id) {
        setIsOnline(false)
      }
    }

    // Register listeners
    socket.on('new_message', handleNewMessage)
    socket.on('conversation_history', handleConversationHistory)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_online', handleUserOnline)
    socket.on('user_offline', handleUserOffline)

    // Cleanup
    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('conversation_history', handleConversationHistory)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_online', handleUserOnline)
      socket.off('user_offline', handleUserOffline)
      socket.leaveConversation(conversationId)
    }
  }, [isConnected, conversationId, currentUserId, otherUser.id, socket, markAsRead])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      startTyping(conversationId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping(conversationId)
    }, 1000)
  }

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !isConnected) return

    const messageData = {
      conversationId,
      content: newMessage.trim(),
      type: 'text' as const,
    }

    sendMessage(messageData)
    setNewMessage('')
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      stopTyping(conversationId)
    }

    // Focus input
    inputRef.current?.focus()
  }

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  // Render message status
  const renderMessageStatus = (message: ChatMessage) => {
    if (message.sender.id !== currentUserId) return null

    return message.readAt ? (
      <CheckCheck className="w-4 h-4 text-blue-500" />
    ) : (
      <Check className="w-4 h-4 text-gray-400" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {otherUser.name.charAt(0)}
              </span>
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender.id === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm break-words">{message.content}</p>
              <div className={`flex items-center justify-between mt-1 gap-2 ${
                message.sender.id === currentUserId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">
                  {formatMessageTime(message.createdAt)}
                </span>
                {renderMessageStatus(message)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.map((typingUser) => (
          <div key={typingUser.userId} className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {typingUser.name} está digitando...
                </span>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={!isConnected}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={isConnected ? "Digite uma mensagem..." : "Conectando..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {/* Connection status */}
        <div className="mt-2 text-xs text-center">
          {isConnected ? (
            <span className="text-green-600">● Conectado</span>
          ) : (
            <span className="text-red-600">● Desconectado</span>
          )}
        </div>
      </div>
    </div>
  )
}
