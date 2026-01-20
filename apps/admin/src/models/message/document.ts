import { Schema, Document, Types } from "mongoose"

export interface MessageAttachment {
  url: string
  type: "image" | "file" | "audio" | "video"
  name?: string
  size?: number
  mimeType?: string
}

export interface ReadReceipt {
  user: Types.ObjectId
  readAt: Date
}

export interface MessageDocument extends Document {
  conversation: Types.ObjectId
  sender: Types.ObjectId
  content: string
  type: "text" | "image" | "file" | "audio" | "video"
  attachments: MessageAttachment[]
  status: "sent" | "delivered" | "read" | "failed"
  readBy: ReadReceipt[]
  replyTo?: Types.ObjectId
  isDeleted: boolean
  deletedAt?: Date
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export const MessageSchema = new Schema<MessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "file", "audio", "video"],
          required: true,
        },
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
      index: true,
    },
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    editedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Index composés pour recherche efficace
MessageSchema.index({ conversation: 1, createdAt: -1 })
MessageSchema.index({ sender: 1, createdAt: -1 })
