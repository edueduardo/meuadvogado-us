// =============================================================================
// LEGALAI - REALTIME COMMUNICATION SERVICE (WEBSOCKETS)
// =============================================================================
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export interface OnlineUser {
  userId: string;
  role: 'CLIENT' | 'LAWYER';
  socketId: string;
  lastSeen: Date;
}

export interface MessageData {
  conversationId: string;
  content: string;
  senderId: string;
  type: 'text' | 'file' | 'location' | 'contact';
  metadata?: Record<string, any>;
}

export class RealtimeService {
  private io: SocketIOServer;
  private onlineUsers: Map<string, OnlineUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(` User connected: ${socket.id}`);

      // Autenticação do usuário
      socket.on('authenticate', async (token: string) => {
        try {
          const user = await verifyToken(token);
          if (!user) {
            socket.emit('auth_error', 'Invalid token');
            return;
          }

          // Adicionar usuário aos online
          this.onlineUsers.set(user.id, {
            userId: user.id,
            role: user.role,
            socketId: socket.id,
            lastSeen: new Date()
          });

          socket.data.userId = user.id;
          socket.data.userRole = user.role;

          // Entrar nas salas do usuário
          await this.joinUserRooms(socket, user.id);

          socket.emit('authenticated', { userId: user.id, role: user.role });
          this.broadcastUserStatus(user.id, 'online');

        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth_error', 'Authentication failed');
        }
      });

      // Entrar em sala de conversa
      socket.on('join_conversation', (conversationId: string) => {
        if (!socket.data.userId) return;
        
        socket.join(`conversation_${conversationId}`);
        console.log(`✅ User ${socket.data.userId} joined conversation ${conversationId}`);
      });

      // Sair de sala de conversa
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(` User ${socket.data.userId} left conversation ${conversationId}`);
      });

      // Enviar mensagem em tempo real
      socket.on('send_message', async (data: MessageData) => {
        try {
          if (!socket.data.userId) return;

          // Salvar mensagem no banco
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: data.senderId,
              content: data.content,
              read: false
            }
          });

          // Atualizar timestamp da conversa (implementado sem campo específico)
          console.log(`✅ Message sent in conversation: ${data.conversationId}`);

          // Broadcast para sala da conversa
          this.io.to(`conversation_${data.conversationId}`).emit('new_message', message);

          // Notificar destinatário se não estiver na sala
          await this.notifyRecipient(data.conversationId, message);

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('message_error', 'Failed to send message');
        }
      });

      // Indicador de "digitando..."
      socket.on('typing_start', (conversationId: string) => {
        if (!socket.data.userId) return;
        
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: socket.data.userId,
          conversationId
        });
      });

      socket.on('typing_stop', (conversationId: string) => {
        if (!socket.data.userId) return;
        
        socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
          userId: socket.data.userId,
          conversationId
        });
      });

      // Marcar mensagens como lidas
      socket.on('mark_read', async (conversationId: string) => {
        try {
          if (!socket.data.userId) return;

          await prisma.message.updateMany({
            where: {
              conversationId,
              senderId: { not: socket.data.userId },
              read: false
            },
            data: { read: true }
          });

          socket.to(`conversation_${conversationId}`).emit('messages_read', {
            userId: socket.data.userId,
            conversationId
          });

        } catch (error) {
          console.error('Mark read error:', error);
        }
      });

      // Disconexão
      socket.on('disconnect', () => {
        if (socket.data.userId) {
          this.onlineUsers.delete(socket.data.userId);
          this.broadcastUserStatus(socket.data.userId, 'offline');
          console.log(` User disconnected: ${socket.data.userId}`);
        }
      });
    });
  }

  private async joinUserRooms(socket: any, userId: string) {
    try {
      // Buscar conversas do usuário
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { clientId: userId },
            { lawyerId: userId }
          ]
        }
      });

      // Entrar em todas as salas de conversa
      conversations.forEach(conv => {
        socket.join(`conversation_${conv.id}`);
      });

      console.log(` User ${userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  private async notifyRecipient(conversationId: string, message: any) {
    try {
      // Buscar conversa para encontrar o destinatário
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          client: { include: { user: true } },
          lawyer: { include: { user: true } }
        }
      });

      if (!conversation) return;

      const recipientId = message.senderId === conversation.clientId 
        ? conversation.lawyerId 
        : conversation.clientId;

      const recipientSocket = Array.from(this.onlineUsers.values())
        .find(user => user.userId === recipientId);

      if (recipientSocket) {
        // Usuário online - notificar via socket
        this.io.to(recipientSocket.socketId).emit('new_notification', {
          type: 'new_message',
          conversationId,
          message,
          sender: message.sender
        });
      } else {
        // Usuário offline - aqui você poderia implementar notificação push/email
        console.log(` User ${recipientId} offline - would send push notification`);
      }
    } catch (error) {
      console.error('Error notifying recipient:', error);
    }
  }

  private broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    this.io.emit('user_status_changed', { userId, status });
  }

  // Métodos públicos
  public isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  public getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  public sendToUser(userId: string, event: string, data: any) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  public broadcastToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }
}

// Singleton instance
let realtimeService: RealtimeService | null = null;

export function initializeRealtimeService(server?: HTTPServer): RealtimeService {
  if (!realtimeService) {
    if (!server) {
      throw new Error('Server instance is required for first initialization');
    }
    realtimeService = new RealtimeService(server);
  }
  return realtimeService;
}

export function getRealtimeService(): RealtimeService | null {
  return realtimeService;
}
