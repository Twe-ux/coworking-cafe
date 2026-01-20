/**
 * Types pour le module Messages (Messagerie)
 */

export type ConversationType = "direct" | "group"
export type MessageType = "text" | "image" | "file" | "audio" | "video"
export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export interface MessageAttachment {
  url: string
  type: "image" | "file" | "audio" | "video"
  name?: string
  size?: number
  mimeType?: string
}

export interface ReadReceipt {
  user: string
  readAt: string
}

export interface Message {
  _id?: string
  conversation: string
  sender: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  content: string
  type: MessageType
  attachments: MessageAttachment[]
  status: MessageStatus
  readBy: ReadReceipt[]
  replyTo?: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt?: string
  editedAt?: string
}

export interface ConversationParticipant {
  user: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  joinedAt: string
  lastReadAt?: string
  unreadCount: number
}

export interface Conversation {
  _id?: string
  type: ConversationType
  participants: ConversationParticipant[]
  name?: string
  avatar?: string
  description?: string
  createdBy?: string
  lastMessage?: Message
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface ConversationFormData {
  participantIds: string[]
  type: ConversationType
  name?: string
  description?: string
}

export interface MessageFormData {
  content: string
  type?: MessageType
  attachments?: MessageAttachment[]
  replyTo?: string
}

export interface MessagesFilter {
  conversationId?: string
  page?: number
  limit?: number
}
