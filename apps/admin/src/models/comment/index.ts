import mongoose from "mongoose"
import { CommentSchema, type CommentDocument } from "./document"

export type { CommentDocument }

export const Comment =
  (mongoose.models.Comment as mongoose.Model<CommentDocument>) ||
  mongoose.model<CommentDocument>("Comment", CommentSchema)
