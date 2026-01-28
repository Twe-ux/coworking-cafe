import { Schema, Document, Types } from "mongoose"

export interface ArticleDocument extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  author: Types.ObjectId
  category?: Types.ObjectId
  status: "draft" | "published" | "archived" | "scheduled"
  publishedAt?: Date
  scheduledFor?: Date
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  ogImage?: string
  viewCount: number
  likeCount: number
  readingTime: number
  createdAt: Date
  updatedAt: Date
}

export const ArticleSchema = new Schema<ArticleDocument>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    featuredImage: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
      index: true,
    },
    publishedAt: Date,
    scheduledFor: Date,
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    metaKeywords: [String],
    ogImage: String,
    viewCount: {
      type: Number,
      default: 0,
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      index: true,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index composés
ArticleSchema.index({ status: 1, publishedAt: -1 })
ArticleSchema.index({ category: 1, status: 1 })
ArticleSchema.index({ author: 1, createdAt: -1 })

// Générer le slug automatiquement avant save
ArticleSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

// Calculer le temps de lecture (environ 200 mots/min)
ArticleSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordCount = this.content.split(/\s+/).length
    this.readingTime = Math.ceil(wordCount / 200)
  }
  next()
})
