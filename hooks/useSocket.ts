// =============================================================================
// SOCKET.IO HOOK FOR REALTIME COMMUNICATION
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  connected: boolean;
  error: string | null;
  typingUsers: Record<string, boolean>;
}

export const useSocket = (token?: string) => {
  const [state, setState] = useState<SocketState>({
    connected: false,
    error: null,
    typingUsers: {}
  });

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const socket = io(process.env.NEXTAUTH_URL || 'http://localhost:3000', {
      path: '/api/socket/io',
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔗 Connected to socket server');
      setState(prev => ({ ...prev, connected: true, error: null }));
      
      // Authenticate with token
      socket.emit('authenticate', token);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      setState(prev => ({ ...prev, connected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({ ...prev, error: error.message }));
    });

    // Authentication
    socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
    });

    socket.on('auth_error', (error) => {
      console.error('Authentication error:', error);
      setState(prev => ({ ...prev, error }));
    });

    // Message events
    socket.on('new_message', (message) => {
      console.log('📨 New message:', message);
      // Custom event handler can be set by component
    });

    socket.on('message_error', (error) => {
      console.error('Message error:', error);
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      setState(prev => ({
        ...prev,
        typingUsers: { ...prev.typingUsers, [data.userId]: true }
      }));

      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current[data.userId]) {
        clearTimeout(typingTimeoutRef.current[data.userId]);
      }
      
      typingTimeoutRef.current[data.userId] = setTimeout(() => {
        setState(prev => {
          const newTypingUsers = { ...prev.typingUsers };
          delete newTypingUsers[data.userId];
          return { ...prev, typingUsers: newTypingUsers };
        });
      }, 3000);
    });

    socket.on('user_stop_typing', (data) => {
      setState(prev => {
        const newTypingUsers = { ...prev.typingUsers };
        delete newTypingUsers[data.userId];
        return { ...prev, typingUsers: newTypingUsers };
      });

      if (typingTimeoutRef.current[data.userId]) {
        clearTimeout(typingTimeoutRef.current[data.userId]);
      }
    });

    // Read receipts
    socket.on('messages_read', (data) => {
      console.log('📖 Messages read:', data);
    });

    // User status
    socket.on('user_status_changed', (data) => {
      console.log('👤 User status changed:', data);
    });

    // Notifications
    socket.on('new_notification', (notification) => {
      console.log('🔔 New notification:', notification);
    });

    return () => {
      // Cleanup
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Methods
  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  };

  const sendMessage = (data: {
    conversationId: string;
    content: string;
    senderId: string;
    type?: string;
  }) => {
    socketRef.current?.emit('send_message', data);
  };

  const startTyping = (conversationId: string) => {
    socketRef.current?.emit('typing_start', conversationId);
  };

  const stopTyping = (conversationId: string) => {
    socketRef.current?.emit('typing_stop', conversationId);
  };

  const markAsRead = (conversationId: string) => {
    socketRef.current?.emit('mark_read', conversationId);
  };

  // Custom event listeners
  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    ...state,
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    on,
    off
  };
};
