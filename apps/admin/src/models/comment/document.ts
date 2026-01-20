import { Schema, Document, Types } from "mongoose"

export interface CommentDocument extends Document {
  content: string
  article: Types.ObjectId
  user: Types.ObjectId
  parent?: Types.ObjectId
  status: "pending" | "approved" | "rejected" | "spam"
  likeCount: number
  createdAt: Date
  updatedAt: Date
}

export const CommentSchema = new Schema<CommentDocument>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index composés
CommentSchema.index({ article: 1, status: 1, createdAt: -1 })
CommentSchema.index({ user: 1, createdAt: -1 })
CommentSchema.index({ parent: 1, createdAt: 1 })
