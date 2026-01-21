import { Schema, Types, Document } from 'mongoose';

export type ConversationType = 'direct' | 'group';

/**
 * Conversation Participant Interface
 */
export interface ConversationParticipant {
  user: Types.ObjectId;
  joinedAt: Date;
  lastReadAt?: Date;
  unreadCount: number;
}

/**
 * Conversation Document Interface
 * Chat conversations between users
 */
export interface ConversationDocument extends Document {
  type: ConversationType;
  participants: ConversationParticipant[];
  name?: string;
  avatar?: string;
  description?: string;
  createdBy?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

/**
 * Conversation Schema
 */
export const ConversationSchema = new Schema<ConversationDocument>(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: [true, 'Conversation type is required'],
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        lastReadAt: {
          type: Date,
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ConversationSchema.index({ 'participants.user': 1 });
ConversationSchema.index({ type: 1, isDeleted: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
