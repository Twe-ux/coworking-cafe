import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { initSocket, getSocket, disconnectSocket } from '../lib/socket-client'

export interface UseSocketOptions {
  url: string
  token: string
  autoConnect?: boolean
}

export interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { url, token, autoConnect = true } = options
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!autoConnect) return

    const socketInstance = initSocket(url, token)
    setSocket(socketInstance)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      disconnectSocket()
    }
  }, [url, token, autoConnect])

  return {
    socket,
    isConnected,
    connect: () => {
      if (!socket) {
        const socketInstance = initSocket(url, token)
        setSocket(socketInstance)
      }
    },
    disconnect: () => {
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
    },
  }
}
