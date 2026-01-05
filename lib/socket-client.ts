// lib/socket-client.ts
// Socket.IO client for real-time chat

import { io, Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  conversationId: string
  sender: {
    id: string
    name: string
    role: string
  }
  content: string
  type: 'text' | 'file' | 'image'
  createdAt: string
  readAt?: string
}

export interface TypingUser {
  userId: string
  name: string
  conversationId: string
  isTyping: boolean
}

export interface OnlineUser {
  userId: string
  name: string
  role: string
}

export class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private connect() {
    const serverUrl = process.env.NODE_ENV === 'production'
      ? 'https://meuadvogado-us.vercel.app'
      : 'http://localhost:3000'

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO:', reason)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.reconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      this.reconnect()
    })

    // Authentication events
    this.socket.on('authenticated', (user) => {
      console.log('Authenticated as:', user)
    })

    this.socket.on('auth_error', (error) => {
      console.error('Authentication error:', error)
    })

    // Message events
    this.socket.on('new_message', (message: ChatMessage) => {
      this.emit('new_message', message)
    })

    this.socket.on('conversation_history', (data) => {
      this.emit('conversation_history', data)
    })

    // User status events
    this.socket.on('user_online', (user: OnlineUser) => {
      this.emit('user_online', user)
    })

    this.socket.on('user_offline', (user: OnlineUser) => {
      this.emit('user_offline', user)
    })

    // Typing events
    this.socket.on('user_typing', (typingUser: TypingUser) => {
      this.emit('user_typing', typingUser)
    })

    // Conversation events
    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data)
    })

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data)
    })

    // Read receipts
    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data)
    })

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error)
      this.emit('error', error)
    })
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  // Public methods
  public authenticate(token: string) {
    if (!this.socket) return
    this.socket.emit('authenticate', token)
  }

  public joinConversation(conversationId: string) {
    if (!this.socket) return
    this.socket.emit('join_conversation', conversationId)
  }

  public leaveConversation(conversationId: string) {
    if (!this.socket) return
    this.socket.emit('leave_conversation', conversationId)
  }

  public sendMessage(data: {
    conversationId: string
    content: string
    type?: 'text' | 'file' | 'image'
  }) {
    if (!this.socket) return
    this.socket.emit('send_message', data)
  }

  public startTyping(conversationId: string) {
    if (!this.socket) return
    this.socket.emit('typing_start', conversationId)
  }

  public stopTyping(conversationId: string) {
    if (!this.socket) return
    this.socket.emit('typing_stop', conversationId)
  }

  public markAsRead(data: {
    conversationId: string
    messageIds: string[]
  }) {
    if (!this.socket) return
    this.socket.emit('mark_read', data)
  }

  public disconnect() {
    if (!this.socket) return
    this.socket.disconnect()
    this.socket = null
  }

  public isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Event listener management
  private eventListeners: Map<string, Function[]> = new Map()

  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)?.push(callback)
  }

  public off(event: string, callback?: Function) {
    if (!this.eventListeners.has(event)) return
    
    if (callback) {
      const listeners = this.eventListeners.get(event)
      const index = listeners?.indexOf(callback)
      if (index !== undefined && index > -1) {
        listeners?.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(event)
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in socket event listener:', error)
        }
      })
    }
  }
}

// Singleton instance
let socketClient: SocketClient | null = null

export function getSocketClient(): SocketClient {
  if (!socketClient) {
    socketClient = new SocketClient()
  }
  return socketClient
}

// React hook for Socket.IO
export function useSocket() {
  const [socket] = useState(() => getSocketClient())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // Get auth token and authenticate
    const token = localStorage.getItem('auth-token')
    if (token) {
      socket.authenticate(token)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return {
    socket,
    isConnected,
    authenticate: socket.authenticate.bind(socket),
    joinConversation: socket.joinConversation.bind(socket),
    leaveConversation: socket.leaveConversation.bind(socket),
    sendMessage: socket.sendMessage.bind(socket),
    startTyping: socket.startTyping.bind(socket),
    stopTyping: socket.stopTyping.bind(socket),
    markAsRead: socket.markAsRead.bind(socket),
  }
}

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react'
