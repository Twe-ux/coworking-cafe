import { Schema, Document, Types } from "mongoose"

export interface CategoryDocument extends Document {
  name: string
  slug: string
  description?: string
  parent?: Types.ObjectId
  image?: string
  icon?: string
  color?: string
  metaTitle?: string
  metaDescription?: string
  articleCount: number
  order: number
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

export const CategorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    image: String,
    icon: String,
    color: {
      type: String,
      default: "#4F46E5",
    },
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    articleCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index composés
CategorySchema.index({ isVisible: 1, order: 1 })

// Générer le slug automatiquement
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})
