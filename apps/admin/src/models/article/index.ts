import mongoose from "mongoose"
import { ArticleSchema, type ArticleDocument } from "./document"

export type { ArticleDocument }

export const Article =
  (mongoose.models.Article as mongoose.Model<ArticleDocument>) ||
  mongoose.model<ArticleDocument>("Article", ArticleSchema)
