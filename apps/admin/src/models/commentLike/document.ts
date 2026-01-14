import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommentLike extends Document {
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one like per user per comment
CommentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

// Index for queries
CommentLikeSchema.index({ comment: 1 });
CommentLikeSchema.index({ user: 1 });

const CommentLike: Model<ICommentLike> =
  mongoose.models.CommentLike ||
  mongoose.model<ICommentLike>('CommentLike', CommentLikeSchema);

export default CommentLike;
