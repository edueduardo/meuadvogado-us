// =============================================================================
// SOCKET.IO SERVER FOR NEXT.JS
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { initializeRealtimeService } from '@/lib/realtime/RealtimeService';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('🔌 Socket.io already initialized');
    res.end();
    return;
  }

  console.log('🚀 Initializing Socket.io server...');

  // Create HTTP server
  const httpServer: NetServer = res.socket.server as any;
  
  // Initialize Socket.IO
  const io = new ServerIO(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Store io instance on response
  res.socket.server.io = io;

  // Initialize our realtime service
  const realtimeService = initializeRealtimeService(httpServer);

  // Basic connection handler
  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io server initialized successfully');
  res.end();
};

export default SocketHandler;
