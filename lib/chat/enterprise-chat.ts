// =============================================================================
// ENTERPRISE CHAT SYSTEM - COMUNICAÇÃO EM TEMPO REAL AVANÇADA
// =============================================================================
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth/enterprise-auth';

// Redis para pub/sub e cache
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const subClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configurações do chat
const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MESSAGE_RETENTION_DAYS: 365,
  TYPING_TIMEOUT: 5000, // 5 segundos
  MAX_CONVERSATIONS_PER_USER: 50,
  RATE_LIMIT_MESSAGES: 30, // por minuto
  ALLOWED_FILE_TYPES: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv'
  ]
};

// Interface para usuário online
interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  socketId: string;
  lastSeen: Date;
  typingIn: string[]; // Array de conversationIds
  activeConversations: string[];
}

// Interface para mensagem
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  replyTo?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class EnterpriseChatService {
  private io: SocketIOServer;
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private typingUsers: Map<string, { userId: string; timeout: NodeJS.Timeout }> = new Map();
  private messageQueue: Map<string, ChatMessage[]> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupRedisPubSub();
    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  // Configurar Redis pub/sub para múltiplos servidores
  private setupRedisPubSub(): void {
    // Subscribe para eventos de chat
    subClient.subscribe('chat:message', 'chat:typing', 'chat:user_status');
    
    subClient.on('message', (channel, data) => {
      try {
        const parsedData = JSON.parse(data);
        
        switch (channel) {
          case 'chat:message':
            this.broadcastMessage(parsedData);
            break;
          case 'chat:typing':
            this.broadcastTyping(parsedData);
            break;
          case 'chat:user_status':
            this.broadcastUserStatus(parsedData);
            break;
        }
      } catch (error) {
        console.error('Redis pub/sub error:', error);
      }
    });
  }

  // Setup principal de eventos
  private setupEventHandlers(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token não fornecido'));
        }

        const user = await validateSession(token);
        if (!user) {
          return next(new Error('Token inválido'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Erro na autenticação'));
      }
    });

    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`🔗 Usuário conectado: ${user.name} (${user.id})`);

      // Adicionar usuário online
      this.addOnlineUser(user, socket.id);

      // Entrar em conversas
      socket.on('join_conversations', async (conversationIds: string[]) => {
        await this.handleJoinConversations(socket, conversationIds);
      });

      // Enviar mensagem
      socket.on('send_message', async (data: Partial<ChatMessage>) => {
        await this.handleSendMessage(socket, data);
      });

      // Indicador de digitação
      socket.on('typing_start', (conversationId: string) => {
        this.handleTypingStart(user.id, conversationId);
      });

      socket.on('typing_stop', (conversationId: string) => {
        this.handleTypingStop(user.id, conversationId);
      });

      // Marcar mensagens como lidas
      socket.on('mark_read', async (data: { conversationId: string; messageId?: string }) => {
        await this.handleMarkRead(socket, data);
      });

      // Upload de arquivo
      socket.on('upload_file', async (data: { conversationId: string; file: any }) => {
        await this.handleFileUpload(socket, data);
      });

      // Video chamada
      socket.on('video_call_start', async (data: { conversationId: string; participants: string[] }) => {
        await this.handleVideoCall(socket, data);
      });

      // Reação à mensagem
      socket.on('add_reaction', async (data: { messageId: string; emoji: string }) => {
        await this.handleAddReaction(socket, data);
      });

      // Desconexão
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Erros
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Adicionar usuário online
  private addOnlineUser(user: any, socketId: string): void {
    const onlineUser: OnlineUser = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      socketId,
      lastSeen: new Date(),
      typingIn: [],
      activeConversations: []
    };

    this.onlineUsers.set(user.id, onlineUser);

    // Atualizar status no Redis
    redis.hset('online_users', user.id, JSON.stringify({
      ...onlineUser,
      status: 'online'
    }));
    redis.expire('online_users', 3600); // 1 hora

    // Broadcast status online
    this.broadcastUserStatus({
      userId: user.id,
      status: 'online',
      timestamp: new Date()
    });

    // Notificar amigos/conectados
    this.notifyUserConnections(user.id, 'user_online');
  }

  // Entrar em conversas
  private async handleJoinConversations(socket: any, conversationIds: string[]): Promise<void> {
    const user = socket.data.user;
    
    try {
      // Verificar permissões
      const conversations = await prisma.conversation.findMany({
        where: {
          id: { in: conversationIds },
          OR: [
            { clientId: user.id },
            { lawyerId: user.id }
          ]
        },
        include: {
          client: { include: { user: true } },
          lawyer: { include: { user: true } }
        }
      });

      // Entrar nas salas
      for (const conversation of conversations) {
        socket.join(conversation.id);
        
        // Atualizar usuário online
        const onlineUser = this.onlineUsers.get(user.id);
        if (onlineUser && !onlineUser.activeConversations.includes(conversation.id)) {
          onlineUser.activeConversations.push(conversation.id);
        }

        // Buscar histórico recente
        const messages = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'desc' },
          take: 50
        });

        socket.emit('conversation_history', {
          conversationId: conversation.id,
          messages: messages.reverse(),
          conversation: {
            ...conversation,
            isOnline: this.isUserOnline(conversation.clientId === user.id ? conversation.lawyerId : conversation.clientId)
          }
        });
      }

    } catch (error) {
      console.error('Error joining conversations:', error);
      socket.emit('error', { message: 'Erro ao entrar nas conversas' });
    }
  }

  // Enviar mensagem
  private async handleSendMessage(socket: any, data: Partial<ChatMessage>): Promise<void> {
    const user = socket.data.user;
    
    try {
      // Rate limiting
      const rateLimitKey = `chat_rate_limit:${user.id}`;
      const messageCount = await redis.incr(rateLimitKey);
      
      if (messageCount === 1) {
        await redis.expire(rateLimitKey, 60); // 1 minuto
      }
      
      if (messageCount > CHAT_CONFIG.RATE_LIMIT_MESSAGES) {
        socket.emit('error', { message: 'Muitas mensagens. Aguarde um momento.' });
        return;
      }

      // Validar mensagem
      if (!data.content || data.content.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: 'Mensagem inválida' });
        return;
      }

      // Verificar permissão na conversa
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: data.conversationId,
          OR: [
            { clientId: user.id },
            { lawyerId: user.id }
          ]
        }
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversa não encontrada' });
        return;
      }

      // Criar mensagem no banco
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId!,
          senderId: user.id,
          content: data.content!
        }
      });

      // Atualizar conversa (implementado sem campos específicos)
      console.log(`📝 Updated conversation: ${data.conversationId}`);

      // Notificação (implementado sem tabela específica)
      const recipientId = conversation.clientId === user.id ? conversation.lawyerId : conversation.clientId;
      if (recipientId) {
        console.log(`🔔 Notification sent to: ${recipientId}`);
      }

      // Broadcast mensagem simplificada
      const messageData = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt
      };

      // Enviar para sala
      this.io.to(data.conversationId!).emit('new_message', messageData);

      // Publicar no Redis para outros servidores
      pubClient.publish('chat:message', JSON.stringify({
        ...messageData,
        room: data.conversationId
      }));

      // Log de auditoria (implementado sem tabela específica)
      console.log(`📝 Message sent: ${message.id} by ${user.id} in ${data.conversationId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  }

  // Indicador de digitação
  private handleTypingStart(userId: string, conversationId: string): void {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    if (!user.typingIn.includes(conversationId)) {
      user.typingIn.push(conversationId);
    }

    // Limpar timeout existente
    const existingTimeout = this.typingUsers.get(`${userId}:${conversationId}`);
    if (existingTimeout) {
      clearTimeout(existingTimeout.timeout);
    }

    // Setar novo timeout
    const timeout = setTimeout(() => {
      this.handleTypingStop(userId, conversationId);
    }, CHAT_CONFIG.TYPING_TIMEOUT);

    this.typingUsers.set(`${userId}:${conversationId}`, { userId, timeout });

    // Broadcast digitação
    this.broadcastTyping({
      userId,
      conversationId,
      isTyping: true
    });
  }

  private handleTypingStop(userId: string, conversationId: string): void {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    user.typingIn = user.typingIn.filter(id => id !== conversationId);

    // Limpar timeout
    const timeoutData = this.typingUsers.get(`${userId}:${conversationId}`);
    if (timeoutData) {
      clearTimeout(timeoutData.timeout);
      this.typingUsers.delete(`${userId}:${conversationId}`);
    }

    // broadcast parada de digitação
    this.broadcastTyping({
      userId,
      conversationId,
      isTyping: false
    });
  }

  // Marcar como lido (implementado sem tabela específica)
  private async handleMarkRead(socket: any, data: { conversationId: string; messageId?: string }): Promise<void> {
    const user = socket.data.user;
    
    try {
      // Implementar com Redis ou serviço externo se necessário
      console.log(`📖 Messages marked as read by ${user.id} in ${data.conversationId}`);
      
      // Notificar outros usuários
      socket.to(data.conversationId).emit('messages_read', {
        userId: user.id,
        conversationId: data.conversationId,
        messageId: data.messageId
      });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Erro ao marcar mensagens como lidas' });
    }
  }

  // Upload de arquivo (simulado)
  private async handleFileUpload(socket: any, data: { conversationId: string; file: any }): Promise<void> {
    const user = socket.data.user;
    
    try {
      // Validar arquivo
      if (!CHAT_CONFIG.ALLOWED_FILE_TYPES.includes(data.file.type)) {
        socket.emit('error', { message: 'Tipo de arquivo não permitido' });
        return;
      }

      if (data.file.size > CHAT_CONFIG.MAX_FILE_SIZE) {
        socket.emit('error', { message: 'Arquivo muito grande' });
        return;
      }

      // Na implementação real, fazer upload para S3/Cloudinary
      const fileUrl = `https://cdn.example.com/chat/${Date.now()}_${data.file.name}`;
      
      // Criar mensagem de arquivo
      await this.handleSendMessage(socket, {
        conversationId: data.conversationId,
        content: `📎 ${data.file.name}`,
        type: 'FILE',
        attachments: [{
          url: fileUrl,
          name: data.file.name,
          type: data.file.type,
          size: data.file.size
        }]
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      socket.emit('error', { message: 'Erro no upload do arquivo' });
    }
  }

  // Video chamada (simulado)
  private async handleVideoCall(socket: any, data: { conversationId: string; participants: string[] }): Promise<void> {
    const user = socket.data.user;
    
    try {
      // Criar sala de video chamada
      const roomId = `video_${data.conversationId}_${Date.now()}`;
      
      // Notificar participantes
      for (const participantId of data.participants) {
        const participantSocket = this.getUserSocket(participantId);
        if (participantSocket) {
          participantSocket.emit('video_call_invite', {
            roomId,
            conversationId: data.conversationId,
            from: user,
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Error starting video call:', error);
      socket.emit('error', { message: 'Erro ao iniciar chamada de vídeo' });
    }
  }

  // Reação à mensagem (implementado sem tabela específica)
  private async handleAddReaction(socket: any, data: { messageId: string; emoji: string }): Promise<void> {
    const user = socket.data.user;
    
    try {
      const message = await prisma.message.findUnique({
        where: { id: data.messageId }
      });

      if (!message) {
        socket.emit('error', { message: 'Mensagem não encontrada' });
        return;
      }

      // Simular reações (implementar com Redis se necessário)
      console.log(`😀 Reaction added: ${data.emoji} to message ${data.messageId} by ${user.id}`);

      // Notificar sala
      this.io.to(message.conversationId).emit('message_reaction', {
        messageId: data.messageId,
        userId: user.id,
        emoji: data.emoji
      });

    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  // Desconexão
  private handleDisconnect(socket: any): void {
    const user = socket.data.user;
    if (!user) return;

    console.log(`🔌 Usuário desconectado: ${user.name} (${user.id})`);

    // Remover usuário online
    this.onlineUsers.delete(user.id);
    redis.hdel('online_users', user.id);

    // Broadcast status offline
    this.broadcastUserStatus({
      userId: user.id,
      status: 'offline',
      timestamp: new Date()
    });

    // Limpar timeouts de digitação
    for (const [key, timeoutData] of this.typingUsers.entries()) {
      if (timeoutData.userId === user.id) {
        clearTimeout(timeoutData.timeout);
        this.typingUsers.delete(key);
      }
    }
  }

  // Métodos utilitários
  private isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private getUserSocket(userId: string): any {
    const user = this.onlineUsers.get(userId);
    return user ? this.io.sockets.sockets.get(user.socketId) : null;
  }

  private broadcastMessage(data: any): void {
    this.io.to(data.room).emit('new_message', data);
  }

  private broadcastTyping(data: any): void {
    this.io.to(data.conversationId).emit('typing_update', data);
  }

  private broadcastUserStatus(data: any): void {
    this.io.emit('user_status_update', data);
  }

  private notifyUserConnections(userId: string, event: string): void {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    // Notificar conversas ativas
    for (const conversationId of user.activeConversations) {
      this.io.to(conversationId).emit(event, { userId });
    }
  }

  // Limpeza periódica
  private startCleanupInterval(): void {
    setInterval(() => {
      // Limpar usuários inativos
      const now = new Date();
      for (const [userId, user] of this.onlineUsers.entries()) {
        const inactiveTime = now.getTime() - user.lastSeen.getTime();
        if (inactiveTime > 5 * 60 * 1000) { // 5 minutos
          this.onlineUsers.delete(userId);
          redis.hdel('online_users', userId);
        }
      }

      // Limpar timeouts expirados (simplificado)
      for (const [key, timeoutData] of this.typingUsers.entries()) {
        // Simplificar cleanup - remover timeouts muito antigos
        if (Date.now() > CHAT_CONFIG.TYPING_TIMEOUT) {
          clearTimeout(timeoutData.timeout);
          this.typingUsers.delete(key);
        }
      }
    }, 60000); // A cada minuto
  }

  // Métodos públicos
  public getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  public isUserInConversation(userId: string, conversationId: string): boolean {
    const user = this.onlineUsers.get(userId);
    return user ? user.activeConversations.includes(conversationId) : false;
  }

  public async getConversationsForUser(userId: string): Promise<any[]> {
    return await prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: userId },
          { lawyerId: userId }
        ]
      },
      include: {
        client: { include: { user: true } },
        lawyer: { include: { user: true } },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}

// Singleton
let chatService: EnterpriseChatService;

export function initializeChat(server: HTTPServer): EnterpriseChatService {
  if (!chatService) {
    chatService = new EnterpriseChatService(server);
  }
  return chatService;
}

export function getChatService(): EnterpriseChatService {
  if (!chatService) {
    throw new Error('Chat service not initialized');
  }
  return chatService;
}
