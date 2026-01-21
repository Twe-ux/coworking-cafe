import { Schema, Types, Document } from "mongoose";

/** Document of a {@link Category}, as stored in the database. */
export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId;
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  articleCount: number;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Category objects for the database. */
export const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: { type: String },
    icon: { type: String },
    color: {
      type: String,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Please provide a valid hex color",
      ],
    },
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    articleCount: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isVisible: 1 });
