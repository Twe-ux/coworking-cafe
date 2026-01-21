import { ObjectId, Schema, Types, Document } from "mongoose";

/** Document of a {@link Comment}, as stored in the database. */
export interface CommentDocument extends Document {
  content: string;
  article: ObjectId;
  user: ObjectId;
  parent?: ObjectId;
  status: "pending" | "approved" | "rejected" | "spam";
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate Comment objects for the database. */
export const CommentSchema = new Schema<CommentDocument>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    article: {
      type: Types.ObjectId,
      ref: "Article",
      required: [true, "Article reference is required"],
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    parent: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
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
