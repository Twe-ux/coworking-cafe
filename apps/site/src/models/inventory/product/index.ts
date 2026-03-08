import mongoose from "mongoose"
import { ProductDocument, ProductSchema } from "./document"

export const Product =
  (mongoose.models.Product as mongoose.Model<ProductDocument>) ||
  mongoose.model<ProductDocument>("Product", ProductSchema)

export type { ProductDocument }
export type { ProductCategory, ProductUnit } from "./document"
