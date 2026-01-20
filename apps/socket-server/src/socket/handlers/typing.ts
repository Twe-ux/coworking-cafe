import { Server, Socket } from 'socket.io'

// In-memory storage for typing indicators
// TODO: Replace with Redis for production
const typingUsers = new Map<string, Set<string>>()

export function setupTypingHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId

  // User started typing
  socket.on('typing-start', (conversationId: string) => {
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Set())
    }
    typingUsers.get(conversationId)!.add(userId)

    // Broadcast to others in conversation
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      conversationId,
      userId,
      isTyping: true,
    })
  })

  // User stopped typing
  socket.on('typing-stop', (conversationId: string) => {
    const users = typingUsers.get(conversationId)
    if (users) {
      users.delete(userId)
      if (users.size === 0) {
        typingUsers.delete(conversationId)
      }
    }

    // Broadcast to others in conversation
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      conversationId,
      userId,
      isTyping: false,
    })
  })

  // Clean up on disconnect
  socket.on('disconnect', () => {
    typingUsers.forEach((users, conversationId) => {
      if (users.has(userId)) {
        users.delete(userId)
        socket.to(`conversation:${conversationId}`).emit('user-typing', {
          conversationId,
          userId,
          isTyping: false,
        })
      }
    })
  })
}
