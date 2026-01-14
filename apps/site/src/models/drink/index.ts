import mongoose, { Schema, Model } from 'mongoose';
import { DrinkDocument, DrinkCategoryDocument } from './document';

// Schema pour les catégories de boissons
const DrinkCategorySchema = new Schema<DrinkCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    type: { type: String, enum: ['drink', 'food'], default: 'drink' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    showOnSite: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'drink_categories'
  }
);

// Schema pour les boissons
const DrinkSchema = new Schema<DrinkDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    recipe: { type: String },
    image: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'DrinkCategory', required: true },
    type: { type: String, enum: ['drink', 'food'], default: 'drink' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'drinks'
  }
);

// Index pour le tri
DrinkCategorySchema.index({ order: 1 });
DrinkSchema.index({ category: 1, order: 1 });

const DrinkCategory: Model<DrinkCategoryDocument> =
  mongoose.models.DrinkCategory || mongoose.model<DrinkCategoryDocument>('DrinkCategory', DrinkCategorySchema);

const Drink: Model<DrinkDocument> =
  mongoose.models.Drink || mongoose.model<DrinkDocument>('Drink', DrinkSchema);

export { DrinkCategory, Drink };
export type { DrinkDocument, DrinkCategoryDocument };
