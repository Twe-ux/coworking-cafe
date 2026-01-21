import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleLike extends Document {
  user: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ArticleLikeSchema = new Schema<IArticleLike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one like per user per article
ArticleLikeSchema.index({ user: 1, article: 1 }, { unique: true });

// Index for queries
ArticleLikeSchema.index({ article: 1 });
ArticleLikeSchema.index({ user: 1 });

const ArticleLike: Model<IArticleLike> =
  mongoose.models.ArticleLike ||
  mongoose.model<IArticleLike>('ArticleLike', ArticleLikeSchema);

export default ArticleLike;
