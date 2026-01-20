import { Server, Socket } from 'socket.io'
// Import Mongoose models from @coworking-cafe/database
// Will be completed when we implement full logic

export function setupMessageHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId

  // Send message
  socket.on('send-message', async (data: { conversationId: string; content: string }) => {
    try {
      console.log(`Message from ${userId} to conversation ${data.conversationId}`)

      // TODO: Save to MongoDB via Mongoose model
      // const message = await Message.create({ ... })

      // Emit to conversation room
      io.to(`conversation:${data.conversationId}`).emit('new-message', {
        conversationId: data.conversationId,
        content: data.content,
        senderId: userId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Mark messages as read
  socket.on('mark-read', async (data: { conversationId: string; messageIds: string[] }) => {
    try {
      console.log(`User ${userId} marked messages as read in ${data.conversationId}`)

      // TODO: Update MongoDB

      // Notify other participants
      socket.to(`conversation:${data.conversationId}`).emit('messages-read', {
        userId,
        messageIds: data.messageIds,
      })
    } catch (error) {
      console.error('Error marking as read:', error)
      socket.emit('error', { message: 'Failed to mark as read' })
    }
  })
}
