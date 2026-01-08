// lib/socket.ts
// Socket.IO server configuration and real-time chat

import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { verifyToken } from './auth'
import { prisma } from './prisma'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Socket.IO server instance
let io: ServerIO | null = null

// Helper function to get Socket.IO server
export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

// Initialize Socket.IO server
export function initializeSocket(server: NetServer) {
  if (io) {
    console.log('Socket.IO already initialized')
    return io
  }

  io = new ServerIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://meuadvogado-us.vercel.app']
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Authentication middleware
    socket.on('authenticate', async (token: string) => {
      try {
        // Verify JWT token and get user
        const user = await verifyToken(token)
        if (!user) {
          socket.emit('auth_error', 'Invalid token')
          socket.disconnect()
          return
        }

        // Attach user to socket
        socket.data.user = user
        socket.data.userId = user.id
        socket.data.userRole = user.role

        // Join user's personal room
        socket.join(`user:${user.id}`)

        // Update online status
        await updateUserOnlineStatus(user.id, true)

        // Join role-based rooms
        if (user.role === 'LAWYER') {
          socket.join('lawyers')
        } else if (user.role === 'CLIENT') {
          socket.join('clients')
        }

        // Join user's conversations
        await joinUserConversations(socket, user.id)

        // Notify friends of online status
        socket.broadcast.emit('user_online', {
          userId: user.id,
          name: user.name,
          role: user.role,
        })

        // Send success response
        socket.emit('authenticated', {
          userId: user.id,
          name: user.name,
          role: user.role,
        })

        console.log(`User authenticated: ${user.name} (${user.id})`)
      } catch (error) {
        console.error('Authentication error:', error)
        socket.emit('auth_error', 'Authentication failed')
        socket.disconnect()
      }
    })

    // Join conversation room
    socket.on('join_conversation', async (conversationId: string) => {
      if (!socket.data.user) {
        socket.emit('error', 'Not authenticated')
        return
      }

      try {
        // Verify user has access to conversation
        const hasAccess = await verifyConversationAccess(
          socket.data.userId,
          conversationId
        )

        if (!hasAccess) {
          socket.emit('error', 'Access denied')
          return
        }

        // Join conversation room
        socket.join(`conversation:${conversationId}`)

        // Notify others in conversation
        socket.to(`conversation:${conversationId}`).emit('user_joined', {
          userId: socket.data.userId,
          name: socket.data.user.name,
          conversationId,
        })

        // Send conversation history
        const messages = await getConversationMessages(conversationId)
        socket.emit('conversation_history', {
          conversationId,
          messages,
        })

        console.log(`User ${socket.data.userId} joined conversation ${conversationId}`)
      } catch (error) {
        console.error('Join conversation error:', error)
        socket.emit('error', 'Failed to join conversation')
      }
    })

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      socket.to(`conversation:${conversationId}`).emit('user_left', {
        userId: socket.data.userId,
        conversationId,
      })
    })

    // Send message with ACK for delivery confirmation
    socket.on('send_message', async (data: {
      conversationId: string
      content: string
      type?: 'text' | 'file' | 'image'
    }, callback?: (response: { success: boolean; messageId?: string }) => void) => {
      if (!socket.data.user) {
        socket.emit('error', 'Not authenticated')
        return
      }

      try {
        // Verify access to conversation
        const hasAccess = await verifyConversationAccess(
          socket.data.userId,
          data.conversationId
        )

        if (!hasAccess) {
          socket.emit('error', 'Access denied')
          return
        }

        // Create message in database
        const message = await createMessage({
          conversationId: data.conversationId,
          senderId: socket.data.userId,
          content: data.content,
          type: data.type || 'text',
        })

        // Broadcast message to conversation
        io!.to(`conversation:${data.conversationId}`).emit('new_message', {
          id: message.id,
          conversationId: data.conversationId,
          sender: {
            id: socket.data.userId,
            name: socket.data.user.name,
            role: socket.data.userRole,
          },
          content: data.content,
          type: data.type || 'text',
          createdAt: message.createdAt,
        })

        // Send notifications to offline users
        await notifyOfflineUsers(data.conversationId, message, socket.data.userId)

        console.log(`Message sent in conversation ${data.conversationId}`)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Typing indicators
    socket.on('typing_start', (conversationId: string) => {
      if (!socket.data.user) return

      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.data.userId,
        name: socket.data.user.name,
        conversationId,
        isTyping: true,
      })
    })

    socket.on('typing_stop', (conversationId: string) => {
      if (!socket.data.user) return

      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.data.userId,
        name: socket.data.user.name,
        conversationId,
        isTyping: false,
      })
    })

    // Mark messages as read
    socket.on('mark_read', async (data: {
      conversationId: string
      messageIds: string[]
    }) => {
      if (!socket.data.user) return

      try {
        await markMessagesAsRead(data.conversationId, socket.data.userId, data.messageIds)
        
        // Notify other user
        socket.to(`conversation:${data.conversationId}`).emit('messages_read', {
          userId: socket.data.userId,
          conversationId: data.conversationId,
          messageIds: data.messageIds,
        })
      } catch (error) {
        console.error('Mark read error:', error)
      }
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      if (socket.data.user) {
        // Update online status
        await updateUserOnlineStatus(socket.data.userId, false)

        // Notify friends of offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.data.userId,
          name: socket.data.user.name,
        })

        console.log(`User disconnected: ${socket.data.user.name} (${socket.data.userId})`)
      } else {
        console.log(`Unauthenticated user disconnected: ${socket.id}`)
      }
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  console.log('Socket.IO server initialized')
  return io
}

// Helper functions

async function updateUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isOnline,
        lastSeen: isOnline ? null : new Date(),
      },
    })
  } catch (error) {
    console.error('Error updating online status:', error)
  }
}

async function joinUserConversations(socket: any, userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: userId },
          { lawyerId: userId },
        ],
      },
      select: { id: true },
    })

    for (const conversation of conversations) {
      socket.join(`conversation:${conversation.id}`)
    }
  } catch (error) {
    console.error('Error joining user conversations:', error)
  }
}

async function verifyConversationAccess(userId: string, conversationId: string): Promise<boolean> {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientId: userId },
          { lawyerId: userId },
        ],
      },
    })

    return !!conversation
  } catch (error) {
    console.error('Error verifying conversation access:', error)
    return false
  }
}

async function getConversationMessages(conversationId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit to last 50 messages
    })

    // Get sender info for each message
    const senderIds = [...new Set(messages.map((m: any) => m.senderId))]
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    const senderMap = new Map(senders.map((s: any) => [s.id, s]))

    return messages.map((msg: any) => {
      const sender = senderMap.get(msg.senderId) as any
      return {
        id: msg.id,
        content: msg.content,
        type: msg.type || 'text',
        sender: sender ? {
          id: sender.id,
          name: sender.name,
          role: sender.role,
        } : null,
        read: msg.read,
        readAt: msg.readAt,
        createdAt: msg.createdAt,
      }
    })
  } catch (error) {
    console.error('Error getting conversation messages:', error)
    return []
  }
}

async function createMessage(data: {
  conversationId: string
  senderId: string
  content: string
  type: string
}) {
  try {
    return await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        type: data.type,
      },
    })
  } catch (error) {
    console.error('Error creating message:', error)
    throw error
  }
}

async function notifyOfflineUsers(
  conversationId: string,
  message: any,
  senderId: string
) {
  try {
    // Get conversation participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        clientId: true,
        lawyerId: true,
      },
    })

    if (!conversation) return

    const participantIds = [conversation.clientId, conversation.lawyerId]
      .filter(Boolean)
      .filter(id => id !== senderId)

    if (participantIds.length === 0) return

    // Get user info for offline check
    const participants = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
        isOnline: false, // Only notify offline users
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Send push notifications (implement with Resend/FCM)
    for (const participant of participants) {
      // TODO: Implement push notification via email
      console.log(`Would send notification to ${participant.name} (${participant.email})`)
    }
  } catch (error) {
    console.error('Error notifying offline users:', error)
  }
}

async function markMessagesAsRead(
  conversationId: string,
  userId: string,
  messageIds: string[]
) {
  try {
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        conversationId,
        senderId: { not: userId }, // Only mark others' messages as read
        readAt: null,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

// Socket.IO API route handler
export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any)?.server?.io) {
    console.log('Initializing Socket.IO...')
    const httpServer: NetServer = (res.socket as any).server
    initializeSocket(httpServer)
    ;(res.socket as any).server.io = io
  }
  res.end()
}
