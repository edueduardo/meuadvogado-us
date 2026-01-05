// app/api/socket/io.ts
// Socket.IO API route for Next.js App Router

import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { initializeSocket } from '@/lib/socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket.IO already running')
  } else {
    console.log('Setting up Socket.IO server...')
    const httpServer: NetServer = res.socket.server as any
    const io = initializeSocket(httpServer)
    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler
