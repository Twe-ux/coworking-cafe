import mongoose from "mongoose"
import { ArticleSchema, type ArticleDocument } from "./document"

export type { ArticleDocument }

// Force model recompilation when schema changes
if (mongoose.models.Article) {
  delete mongoose.models.Article
}

export const Article = mongoose.model<ArticleDocument>("Article", ArticleSchema)
