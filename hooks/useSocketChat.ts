/**
 * Socket.IO Client Hook
 * Enhanced real-time chat with delivery confirmation
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  conversationId: string
  sender: {
    id: string
    name: string
    role: string
  }
  content: string
  type: 'text' | 'file' | 'image'
  createdAt: Date
  readAt?: Date
  delivered?: boolean
}

interface UseSocketChatReturn {
  socket: Socket | null
  connected: boolean
  messages: ChatMessage[]
  typingUsers: string[]
  onlineUsers: string[]
  sendMessage: (conversationId: string, content: string) => void
  markAsRead: (conversationId: string, messageIds: string[]) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
}

export function useSocketChat(): UseSocketChatReturn {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user) return

    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
    const socket = io(undefined, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Connect and authenticate
    socket.on('connect', async () => {
      console.log('[SOCKET] Connected:', socket.id)
      setConnected(true)

      // Get JWT token from session or API
      const token = localStorage.getItem('auth-token') ||
                   sessionStorage.getItem('auth-token') ||
                   (session.user as any).token || ''

      // Authenticate with JWT token
      socket.emit('authenticate', token)
    })

    // Handle authentication
    socket.on('authenticated', (data) => {
      console.log('[SOCKET] Authenticated:', data)
    })

    // Handle new messages with delivery confirmation
    socket.on('new_message', (message: ChatMessage) => {
      console.log('[SOCKET] New message:', message)
      setMessages((prev) => [...prev, { ...message, delivered: true }])

      // Send delivery confirmation
      socket.emit('message_delivered', {
        messageId: message.id,
        conversationId: message.conversationId,
      })
    })

    // Handle delivery confirmations
    socket.on('message_delivered', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, delivered: true } : msg
        )
      )
    })

    // Handle read receipts
    socket.on('messages_read', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id)
            ? { ...msg, readAt: new Date() }
            : msg
        )
      )
    })

    // Handle typing indicators
    socket.on('user_typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) =>
          prev.includes(data.userId) ? prev : [...prev, data.userId]
        )
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
      }
    })

    // Handle online status
    socket.on('user_online', (data) => {
      setOnlineUsers((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      )
    })

    socket.on('user_offline', (data) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId))
    })

    // Handle conversation history
    socket.on('conversation_history', (data) => {
      setMessages(data.messages)
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error('[SOCKET] Error:', error)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected')
      setConnected(false)
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [session])

  // Send message with delivery tracking
  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (!socketRef.current?.connected) {
        console.error('[SOCKET] Not connected')
        return
      }

      const tempId = `temp-${Date.now()}`

      // Optimistic update - add message immediately
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversationId,
        sender: {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          role: session?.user?.role || '',
        },
        content,
        type: 'text',
        createdAt: new Date(),
        delivered: false,
      }

      setMessages((prev) => [...prev, optimisticMessage])

      // Send via socket
      socketRef.current.emit(
        'send_message',
        {
          conversationId,
          content,
          type: 'text',
        },
        (response: { success: boolean; messageId?: string }) => {
          if (response.success) {
            // Replace temp ID with real ID
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempId
                  ? { ...msg, id: response.messageId || tempId, delivered: true }
                  : msg
              )
            )
          }
        }
      )
    },
    [session]
  )

  // Mark messages as read
  const markAsRead = useCallback(
    (conversationId: string, messageIds: string[]) => {
      if (!socketRef.current?.connected) return

      socketRef.current.emit('mark_read', {
        conversationId,
        messageIds,
      })

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, readAt: new Date() } : msg
        )
      )
    },
    []
  )

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return

    socketRef.current.emit('join_conversation', conversationId)
  }, [])

  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return

    socketRef.current.emit('leave_conversation', conversationId)
  }, [])

  return {
    socket: socketRef.current,
    connected,
    messages,
    typingUsers,
    onlineUsers,
    sendMessage,
    markAsRead,
    joinConversation,
    leaveConversation,
  }
}
