import { Schema, Document, Types } from "mongoose"

export interface ConversationParticipant {
  user: Types.ObjectId
  joinedAt: Date
  lastReadAt?: Date
  unreadCount: number
}

export interface ConversationDocument extends Document {
  type: "direct" | "group"
  participants: ConversationParticipant[]
  name?: string
  avatar?: string
  description?: string
  createdBy?: Types.ObjectId
  lastMessage?: Types.ObjectId
  lastMessageAt?: Date
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export const ConversationSchema = new Schema<ConversationDocument>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      index: true,
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastReadAt: Date,
        unreadCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    name: {
      type: String,
      maxlength: 100,
    },
    avatar: String,
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index composé pour recherche efficace
ConversationSchema.index({ type: 1, "participants.user": 1 })
ConversationSchema.index({ lastMessageAt: -1 })

// Validation: au moins 2 participants
ConversationSchema.pre("validate", function (next) {
  if (this.participants.length < 2) {
    next(new Error("Une conversation doit avoir au moins 2 participants"))
  } else {
    next()
  }
})
