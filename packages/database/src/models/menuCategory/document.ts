import { Document, Schema } from "mongoose";

export interface MenuCategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  type: "food" | "drink" | "grocery" | "goodies";
  order: number;
  isActive: boolean;
  showOnSite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuCategorySchema = new Schema<MenuCategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // index defined explicitly below
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["food", "drink", "grocery", "goodies"],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnSite: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "drink_categories", // Utilise la collection existante
  }
);

// Index pour performance
MenuCategorySchema.index({ type: 1, order: 1 });
MenuCategorySchema.index({ slug: 1 });
