import mongoose from "mongoose"
import { TagSchema, type TagDocument } from "./document"

export type { TagDocument }

export const Tag =
  (mongoose.models.Tag as mongoose.Model<TagDocument>) ||
  mongoose.model<TagDocument>("Tag", TagSchema)
