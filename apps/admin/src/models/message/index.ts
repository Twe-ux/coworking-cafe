import mongoose from "mongoose"
import { MessageSchema, type MessageDocument } from "./document"

export type { MessageDocument }

export const Message =
  (mongoose.models.Message as mongoose.Model<MessageDocument>) ||
  mongoose.model<MessageDocument>("Message", MessageSchema)
