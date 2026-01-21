import { Schema, Types, Document } from "mongoose";

/** Document of an {@link Article}, as stored in the database. */
export interface ArticleDocument extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: Types.ObjectId;
  category: Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  status: "draft" | "published" | "archived" | "scheduled";
  publishedAt?: Date;
  scheduledFor?: Date;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate Article objects for the database. */
export const ArticleSchema = new Schema<ArticleDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    featuredImage: { type: String },
    featuredImageAlt: { type: String, trim: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    metaKeywords: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
    },
    publishedAt: { type: Date },
    scheduledFor: { type: Date },
    viewCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ isFeatured: 1, status: 1 });
ArticleSchema.index({ isDeleted: 1 });
ArticleSchema.index({ deletedAt: 1 });
ArticleSchema.index({ title: "text", content: "text" });
