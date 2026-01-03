// =============================================================================
// LEGALAI - REALTIME COMMUNICATION SERVICE (WEBSOCKETS)
// =============================================================================
// import { Server as SocketIOServer } from 'socket.io'; // Dependência não instalada
// import { Server as HTTPServer } from 'http';
import { prisma } from '@/lib/prisma';
// import { verifyToken } from '@/lib/auth'; // Função não existe

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
  // private io: SocketIOServer; // Socket.io não instalado
  private onlineUsers: Map<string, OnlineUser> = new Map();

  constructor() {
    // Temporário - Socket.io não instalado
    // this.io = new SocketIOServer(server, {
    //   cors: {
    //     origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    //     methods: ['GET', 'POST'],
    //   },
    // });
    // this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Temporário - Socket.io não instalado
    // this.io.use(async (socket, next) => {
    //   try {
    //     const token = socket.handshake.auth.token;
    //     const user = await verifyToken(token);
    //     socket.data.user = user;
    //     next();
    //   } catch (error) {
    //     next(new Error('Authentication error'));
    //   }
    // });
    // this.io.on('connection', (socket) => {
    //   this.handleConnection(socket);
    // });
  }

  private handleConnection(socket: any): void {
    // Temporário - Socket.io não instalado
    /*
    const user = socket.data.user;
    
    // Marcar usuário como online
    const onlineUser: OnlineUser = {
      userId: user.id,
      role: user.role,
      socketId: socket.id,
      lastSeen: new Date(),
    };

    this.onlineUsers.set(user.id, onlineUser);

    // Entrar nas salas do usuário
    this.joinUserRooms(socket, user);

    // Enviar lista de usuários online
    this.broadcastOnlineUsers();

    // Setup event handlers
    socket.on('join_conversation', (conversationId: string) => {
      this.handleJoinConversation(socket, conversationId);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      this.handleLeaveConversation(socket, conversationId);
    });

    socket.on('send_message', async (data: MessageData) => {
      await this.handleSendMessage(socket, data);
    });

    socket.on('typing_start', (conversationId: string) => {
      this.handleTypingStart(socket, conversationId);
    });

    socket.on('typing_stop', (conversationId: string) => {
      this.handleTypingStop(socket, conversationId);
    });

    socket.on('video_call_request', (data: { conversationId: string; targetUserId: string }) => {
      this.handleVideoCallRequest(socket, data);
    });

    socket.on('video_call_accept', (data: { conversationId: string; callerId: string }) => {
      this.handleVideoCallAccept(socket, data);
    });

    socket.on('video_call_reject', (data: { conversationId: string; callerId: string }) => {
      this.handleVideoCallReject(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  private async joinUserRooms(socket: any, user: any): Promise<void> {
    try {
      // Buscar conversas do usuário
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { lawyerId: user.id },
            { clientId: user.id },
          ],
        },
        select: { id: true },
      });

      // Entrar em cada sala de conversa
      conversations.forEach((conversation) => {
        socket.join(`conversation:${conversation.id}`);
      });

      // Entrar na sala pessoal do usuário
      socket.join(`user:${user.id}`);
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  private async handleJoinConversation(socket: any, conversationId: string): Promise<void> {
    try {
      // Verificar se usuário tem permissão
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { lawyerId: socket.data.user.id },
            { clientId: socket.data.user.id },
          ],
        },
      });

      if (conversation) {
        socket.join(`conversation:${conversationId}`);
        
        // Notificar outros participantes
        socket.to(`conversation:${conversationId}`).emit('user_joined', {
          userId: socket.data.user.id,
          conversationId,
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  private async handleSendMessage(socket: any, data: MessageData): Promise<void> {
    try {
      // Salvar mensagem no banco
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          isRead: false,
        },
        include: {
          conversation: {
            include: {
              lawyer: { include: { user: true } },
              client: { include: { user: true } },
            },
          },
        },
      });

      // Broadcast para sala da conversa
      this.io.to(`conversation:${data.conversationId}`).emit('new_message', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead,
      });

      // Enviar notificação push para usuário offline
      const recipientId = message.conversation.lawyerId === data.senderId 
        ? message.conversation.clientId 
        : message.conversation.lawyerId;

      if (recipientId && !this.isUserOnline(recipientId)) {
        await this.sendPushNotification(recipientId, {
          title: 'Nova mensagem',
          body: `Você recebeu uma nova mensagem`,
          data: {
            conversationId: data.conversationId,
            messageId: message.id,
          },
        });
      }

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: any, conversationId: string): void {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId: socket.data.user.id,
      conversationId,
      isTyping: true,
    });
  }

  private handleTypingStop(socket: any, conversationId: string): void {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId: socket.data.user.id,
      conversationId,
      isTyping: false,
    });
  }

  private async handleVideoCallRequest(socket: any, data: { conversationId: string; targetUserId: string }): Promise<void> {
    const targetSocket = this.getSocketByUserId(data.targetUserId);
    
    if (targetSocket) {
      targetSocket.emit('video_call_request', {
        conversationId: data.conversationId,
        callerId: socket.data.user.id,
        callerName: socket.data.user.name,
      });
    }
  }

  private async handleVideoCallAccept(socket: any, data: { conversationId: string; callerId: string }): Promise<void> {
    const callerSocket = this.getSocketByUserId(data.callerId);
    
    if (callerSocket) {
      callerSocket.emit('video_call_accepted', {
        conversationId: data.conversationId,
        acceptorId: socket.data.user.id,
      });
    }
  }

  private async handleVideoCallReject(socket: any, data: { conversationId: string; callerId: string }): Promise<void> {
    const callerSocket = this.getSocketByUserId(data.callerId);
    
    if (callerSocket) {
      callerSocket.emit('video_call_rejected', {
        conversationId: data.conversationId,
        rejectorId: socket.data.user.id,
      });
    }
  }

  private handleDisconnect(socket: any): void {
    const user = socket.data.user;
    this.onlineUsers.delete(user.id);
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers(): void {
    const onlineUsersList = Array.from(this.onlineUsers.values());
    this.io.emit('online_users_updated', onlineUsersList);
  }

  private isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private getSocketByUserId(userId: string): any {
    const onlineUser = this.onlineUsers.get(userId);
    if (onlineUser) {
      return this.io.sockets.sockets.get(onlineUser.socketId);
    }
    return null;
  }

  private async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    // Implementar com Firebase Cloud Messaging ou OneSignal
    console.log('Push notification:', notification);
  }

  // Métodos públicos
  public emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToConversation(conversationId: string, event: string, data: any): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  public isUserOnlineStatus(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
  */
  }
}

// Singleton instance
let realtimeService: RealtimeService | null = null;

export function initializeRealtimeService(): RealtimeService {
  if (!realtimeService) {
    realtimeService = new RealtimeService();
  }
  return realtimeService;
}

export function getRealtimeService(): RealtimeService | null {
  return realtimeService;
}
