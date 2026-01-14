import mongoose, { Model, Schema } from "mongoose";
import { FoodCategoryDocument, FoodDocument } from "./document";

// Schema pour les catégories de boissons
const FoodCategorySchema = new Schema<FoodCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "food_categories",
  }
);

// Schema pour les boissons
const FoodSchema = new Schema<FoodDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    recipe: { type: String },
    image: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "drinks",
  }
);

// Index pour le tri
FoodCategorySchema.index({ order: 1 });
FoodSchema.index({ category: 1, order: 1 });

const FoodCategory: Model<FoodCategoryDocument> =
  mongoose.models.FoodCategory ||
  mongoose.model<FoodCategoryDocument>("FoodCategory", FoodCategorySchema);

const Food: Model<FoodDocument> =
  mongoose.models.Food || mongoose.model<FoodDocument>("Food", FoodSchema);

export { Food, FoodCategory };
export type { FoodCategoryDocument, FoodDocument };
