import { Server, Socket } from 'socket.io'

export function setupConversationHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId

  // Join a conversation room
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`)
    console.log(`User ${userId} joined conversation ${conversationId}`)
  })

  // Leave a conversation room
  socket.on('leave-conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`)
    console.log(`User ${userId} left conversation ${conversationId}`)
  })
}
