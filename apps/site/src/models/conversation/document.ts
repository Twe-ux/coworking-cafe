import { Document, ObjectId } from "mongoose";

export type ConversationType = "direct" | "group";

/**
 * Participant in a conversation
 */
export interface ConversationParticipant {
  user: ObjectId;
  joinedAt: Date;
  lastReadAt?: Date;
  unreadCount: number;
}

/**
 * Conversation document
 */
export interface ConversationDocument extends Document {
  type: ConversationType;
  participants: ConversationParticipant[];

  // Group conversation fields
  name?: string; // Only for groups
  avatar?: string; // Only for groups
  description?: string; // Only for groups
  createdBy?: ObjectId; // Only for groups

  // Last message info
  lastMessage?: ObjectId;
  lastMessageAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
