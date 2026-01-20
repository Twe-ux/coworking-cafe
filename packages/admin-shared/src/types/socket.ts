export interface SocketMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file'
  createdAt: string
}

export interface SocketConversation {
  id: string
  participants: string[]
  lastMessage?: SocketMessage
  unreadCount: number
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  isTyping: boolean
}
