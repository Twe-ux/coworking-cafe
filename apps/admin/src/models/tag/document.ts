import { Schema, Document } from "mongoose";

/** Document of a {@link Tag}, as stored in the database. */
export interface TagDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Tag objects for the database. */
export const TagSchema = new Schema<TagDocument>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Tag slug is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Please provide a valid hex color",
      ],
    },
    articleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TagSchema.index({ slug: 1 }, { unique: true });
TagSchema.index({ name: 1 }, { unique: true });
