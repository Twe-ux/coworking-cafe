import { Schema, Document } from "mongoose"

export interface TagDocument extends Document {
  name: string
  slug: string
  description?: string
  color?: string
  articleCount: number
  createdAt: Date
  updatedAt: Date
}

export const TagSchema = new Schema<TagDocument>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
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
      maxlength: 200,
    },
    color: {
      type: String,
      default: "#10B981",
    },
    articleCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Générer le slug automatiquement
TagSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})
