import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleRevision extends Document {
  article: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  category?: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  publishedAt?: Date;
  scheduledFor?: Date;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  author: mongoose.Types.ObjectId;
  revisionNumber: number;
  changeDescription?: string;
  createdAt: Date;
}

const ArticleRevisionSchema = new Schema<IArticleRevision>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    featuredImage: String,
    featuredImageAlt: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'scheduled'],
      default: 'draft',
    },
    publishedAt: Date,
    scheduledFor: Date,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revisionNumber: {
      type: Number,
      required: true,
    },
    changeDescription: String,
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ArticleRevisionSchema.index({ article: 1, revisionNumber: -1 });
ArticleRevisionSchema.index({ article: 1, createdAt: -1 });

const ArticleRevision: Model<IArticleRevision> =
  mongoose.models.ArticleRevision ||
  mongoose.model<IArticleRevision>('ArticleRevision', ArticleRevisionSchema);

export default ArticleRevision;
