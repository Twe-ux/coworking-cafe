import mongoose from "mongoose"
import { CategorySchema, type CategoryDocument } from "./document"

export type { CategoryDocument }

export const Category =
  (mongoose.models.Category as mongoose.Model<CategoryDocument>) ||
  mongoose.model<CategoryDocument>("Category", CategorySchema)
