import { Document, Types } from 'mongoose';

export interface DrinkDocument extends Document {
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  category: Types.ObjectId;
  type: 'drink' | 'food';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrinkCategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  type: 'drink' | 'food';
  order: number;
  isActive: boolean;
  showOnSite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
