import { Schema, Types, Document } from 'mongoose';

/**
 * Comment Document Interface
 * Blog article comments with nested replies
 */
export interface CommentDocument extends Document {
  content: string;
  article: Types.ObjectId;
  user: Types.ObjectId;
  parent?: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Comment Schema
 * Supports nested comments (replies)
 */
export const CommentSchema = new Schema<CommentDocument>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CommentSchema.index({ article: 1, status: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ deletedAt: 1 });
