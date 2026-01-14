import { Document, Types } from "mongoose";

export interface FoodDocument extends Document {
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodCategoryDocument extends Document {
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
