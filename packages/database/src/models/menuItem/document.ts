import { Document, Schema, Types } from "mongoose";

export interface MenuItemDocument extends Document {
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: Types.ObjectId;
  type: "food" | "drink" | "grocery" | "goodies";
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuItemSchema = new Schema<MenuItemDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    recipe: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
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
  },
  {
    timestamps: true,
    collection: "drinks", // Utilise la collection existante (drinks contient food ET drink)
  }
);

// Index pour performance
MenuItemSchema.index({ type: 1, category: 1, order: 1 });
MenuItemSchema.index({ category: 1 });
