// lib/hooks/useChat.ts
// Hook para gerenciar chat em tempo real

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  type: 'text' | 'file' | 'location' | 'contact';
  timestamp: Date;
  read: boolean;
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export function useChat(conversationId: string) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Conectar ao Socket.IO
  useEffect(() => {
    if (!session?.user || !conversationId) return;

    setIsLoading(true);
    setError(null);

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // ========== EVENTOS DE CONEXÃO ==========
    socket.on('connect', () => {
      console.log('✅ Conectado ao servidor de chat');
      setIsConnected(true);

      // Autenticar
      socket.emit('authenticate', {
        userId: session.user.id,
        userRole: session.user.role || 'CLIENT',
        userName: session.user.name || 'Usuário',
        userEmail: session.user.email,
      });
    });

    socket.on('authenticated', () => {
      console.log('✅ Autenticado no servidor');
      // Entrar na conversa
      socket.emit('join_conversation', conversationId);
    });

    socket.on('conversation_joined', (data: { messages: ChatMessage[]; onlineUsers: OnlineUser[] }) => {
      console.log('✅ Entrou na conversa');
      setMessages(data.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })));
      setOnlineUsers(data.onlineUsers);
      setIsLoading(false);
    });

    // ========== EVENTOS DE MENSAGENS ==========
    socket.on('message_received', (message: ChatMessage) => {
      console.log('💬 Mensagem recebida:', message);
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
      }]);
    });

    socket.on('message_sent', (data: { id: string; timestamp: Date }) => {
      console.log('✅ Mensagem enviada');
      // Atualizar ID da mensagem (se foi criada localmente)
    });

    // ========== EVENTOS DE USUÁRIOS ==========
    socket.on('user_joined', (data: { userId: string; userName: string }) => {
      console.log(`👤 ${data.userName} entrou na conversa`);
      setOnlineUsers(prev => [...prev, {
        userId: data.userId,
        userName: data.userName,
        userEmail: '',
      }]);
    });

    socket.on('user_left', (data: { userId: string }) => {
      console.log(`👋 Usuário saiu`);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    socket.on('user_online', (data: { userId: string; userName: string }) => {
      console.log(`✅ ${data.userName} está online`);
    });

    socket.on('user_offline', (data: { userId: string }) => {
      console.log(`👋 Usuário offline`);
    });

    // ========== TYPING INDICATOR ==========
    socket.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean; typingUsers: string[] }) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          const exists = prev.some(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, userName: data.userName, isTyping: true }];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    // ========== LEITURA DE MENSAGENS ==========
    socket.on('messages_read', (data: { conversationId: string; userId: string }) => {
      console.log(`✅ Mensagens lidas por ${data.userId}`);
      setMessages(prev => prev.map(m => ({
        ...m,
        read: m.sender.id === session.user.id ? true : m.read,
      })));
    });

    // ========== ERROS ==========
    socket.on('error', (error: { message: string }) => {
      console.error('❌ Erro no chat:', error.message);
      setError(error.message);
    });

    socket.on('disconnect', () => {
      console.log('👋 Desconectado do servidor');
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.disconnect();
    };
  }, [session, conversationId]);

  // ========== FUNÇÕES ==========

  const sendMessage = useCallback((content: string, type: 'text' | 'file' = 'text', metadata?: Record<string, any>) => {
    if (!socketRef.current || !isConnected) {
      setError('Não conectado ao servidor');
      return;
    }

    if (!content.trim()) {
      setError('Mensagem vazia');
      return;
    }

    socketRef.current.emit('send_message', {
      conversationId,
      content: content.trim(),
      type,
      metadata,
    });
  }, [conversationId, isConnected]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('typing', {
      conversationId,
      isTyping,
    });
  }, [conversationId, isConnected]);

  const markAsRead = useCallback(() => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('mark_read', conversationId);
  }, [conversationId, isConnected]);

  return {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    setTyping,
    markAsRead,
  };
}
