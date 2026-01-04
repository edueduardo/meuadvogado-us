// pages/api/socketio.ts
// Socket.IO Server usando Pages Router (compatível)

import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';
import { Server as ServerIO } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { AuditService, AuditAction, AuditResource } from '@/lib/audit/audit-logs';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketData {
  userId: string;
  userRole: 'CLIENT' | 'LAWYER';
  userName: string;
  userEmail: string;
}

const onlineUsers = new Map<string, SocketData>();
const typingUsers = new Map<string, Set<string>>();

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('✅ Socket.IO já inicializado');
    res.end();
    return;
  }

  console.log('🚀 Inicializando Socket.IO Server...');

  const io = new ServerIO(res.socket.server as any, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    // ========== AUTENTICAÇÃO ==========
    socket.on('authenticate', async (data: SocketData) => {
      try {
        if (!data.userId || !data.userRole) {
          socket.emit('error', { message: 'Dados de autenticação inválidos' });
          return;
        }

        socket.data = data;
        onlineUsers.set(socket.id, data);

        await AuditService.log({
          userId: data.userId,
          action: AuditAction.API_ACCESS,
          resource: AuditResource.API,
          details: { event: 'socket_connect', socketId: socket.id },
          severity: 'LOW',
          tags: ['realtime', 'socket'],
        });

        socket.emit('authenticated', {
          success: true,
          userId: data.userId,
          socketId: socket.id,
        });

        socket.broadcast.emit('user_online', {
          userId: data.userId,
          userName: data.userName,
          timestamp: new Date(),
        });

        console.log(`✅ Usuário autenticado: ${data.userId}`);
      } catch (error) {
        console.error('Erro de autenticação:', error);
        socket.emit('error', { message: 'Falha na autenticação' });
      }
    });

    // ========== ENTRAR EM CONVERSA ==========
    socket.on('join_conversation', async (conversationId: string) => {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Não autenticado' });
        return;
      }

      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversa não encontrada' });
          return;
        }

        // Verificar acesso baseado em clientId ou lawyerId
        const hasAccess = conversation.clientId === socket.data.userId || conversation.lawyerId === socket.data.userId;
        if (!hasAccess) {
          socket.emit('error', { message: 'Sem acesso a esta conversa' });
          return;
        }

        socket.join(`conversation_${conversationId}`);

        const messages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        socket.emit('conversation_joined', {
          conversationId,
          messages: messages.reverse(),
          onlineUsers: Array.from(onlineUsers.values()).filter(u => u.userId !== socket.data.userId),
        });

        socket.to(`conversation_${conversationId}`).emit('user_joined', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          timestamp: new Date(),
        });

        console.log(`✅ ${socket.data.userId} entrou na conversa ${conversationId}`);
      } catch (error) {
        console.error('Erro ao entrar na conversa:', error);
        socket.emit('error', { message: 'Erro ao entrar na conversa' });
      }
    });

    // ========== SAIR DE CONVERSA ==========
    socket.on('leave_conversation', (conversationId: string) => {
      if (!socket.data?.userId) return;

      socket.leave(`conversation_${conversationId}`);
      socket.to(`conversation_${conversationId}`).emit('user_left', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        timestamp: new Date(),
      });

      console.log(`👋 ${socket.data.userId} saiu da conversa ${conversationId}`);
    });

    // ========== ENVIAR MENSAGEM ==========
    socket.on('send_message', async (payload: any) => {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Não autenticado' });
        return;
      }

      try {
        if (!payload.content?.trim()) {
          socket.emit('error', { message: 'Mensagem vazia' });
          return;
        }

        if (payload.content.length > 5000) {
          socket.emit('error', { message: 'Mensagem muito longa' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            conversationId: payload.conversationId,
            senderId: socket.data.userId,
            content: payload.content.trim(),
            read: false,
          },
        });

        await AuditService.log({
          userId: socket.data.userId,
          action: AuditAction.API_ACCESS,
          resource: AuditResource.API,
          resourceId: payload.conversationId,
          details: { event: 'message_sent', messageLength: payload.content.length },
          severity: 'LOW',
          tags: ['chat', 'message'],
        });

        io.to(`conversation_${payload.conversationId}`).emit('message_received', {
          id: message.id,
          conversationId: message.conversationId,
          sender: {
            id: socket.data.userId,
            name: socket.data.userName,
            email: socket.data.userEmail,
          },
          content: message.content,
          type: 'text',
          timestamp: message.createdAt,
          read: message.read,
        });

        if (typingUsers.has(payload.conversationId)) {
          typingUsers.get(payload.conversationId)?.delete(socket.data.userId);
        }

        socket.emit('message_sent', { id: message.id, timestamp: message.createdAt });

        console.log(`💬 Mensagem enviada por ${socket.data.userId}`);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // ========== TYPING INDICATOR ==========
    socket.on('typing', (payload: any) => {
      if (!socket.data?.userId) return;

      if (!typingUsers.has(payload.conversationId)) {
        typingUsers.set(payload.conversationId, new Set());
      }

      if (payload.isTyping) {
        typingUsers.get(payload.conversationId)?.add(socket.data.userId);
      } else {
        typingUsers.get(payload.conversationId)?.delete(socket.data.userId);
      }

      socket.to(`conversation_${payload.conversationId}`).emit('user_typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        isTyping: payload.isTyping,
        typingUsers: Array.from(typingUsers.get(payload.conversationId) || []),
      });
    });

    // ========== MARCAR COMO LIDO ==========
    socket.on('mark_read', async (conversationId: string) => {
      if (!socket.data?.userId) return;

      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            read: false,
            senderId: { not: socket.data.userId },
          },
          data: { read: true },
        });

        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          userId: socket.data.userId,
          timestamp: new Date(),
        });

        console.log(`✅ ${socket.data.userId} marcou mensagens como lidas`);
      } catch (error) {
        console.error('Erro ao marcar como lido:', error);
      }
    });

    // ========== DESCONEXÃO ==========
    socket.on('disconnect', async () => {
      if (socket.data?.userId) {
        onlineUsers.delete(socket.id);

        await AuditService.log({
          userId: socket.data.userId,
          action: AuditAction.LOGOUT,
          resource: AuditResource.API,
          details: { event: 'socket_disconnect', socketId: socket.id },
          severity: 'LOW',
          tags: ['realtime', 'socket'],
        });

        io.emit('user_offline', {
          userId: socket.data.userId,
          timestamp: new Date(),
        });

        console.log(`👋 Cliente desconectado: ${socket.id}`);
      }
    });
  });

  res.socket.server.io = io;
  res.end();
}
