'use client'

import { useEffect } from 'react'
import { getSocketClient } from '@/lib/socket-client'

export default function SocketInitializer() {
  useEffect(() => {
    // Initialize Socket.IO client when component mounts
    const socketClient = getSocketClient()
    
    // Get auth token from localStorage or session
    const token = localStorage.getItem('auth-token') || 
                  sessionStorage.getItem('auth-token')
    
    if (token) {
      socketClient.authenticate(token)
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount as we want to maintain connection
      // across page navigations
    }
  }, [])

  return null // This component doesn't render anything
}
