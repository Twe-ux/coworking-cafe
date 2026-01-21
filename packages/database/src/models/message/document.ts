import { Schema, Types, Document } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Message Attachment Interface
 */
export interface MessageAttachment {
  url: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name?: string;
  size?: number;
  mimeType?: string;
}

/**
 * Read Receipt Interface
 */
export interface ReadReceipt {
  user: Types.ObjectId;
  readAt: Date;
}

/**
 * Message Document Interface
 * Messages within conversations
 */
export interface MessageDocument extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  status: MessageStatus;
  readBy: ReadReceipt[];
  replyTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

/**
 * Message Schema
 */
export const MessageSchema = new Schema<MessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video'],
      default: 'text',
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['image', 'file', 'audio', 'video'],
          required: true,
        },
        name: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        readAt: { type: Date, required: true },
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    deletedAt: {
      type: Date,
    },
    editedAt: {
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
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ status: 1 });
