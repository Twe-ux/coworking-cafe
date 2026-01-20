import mongoose from "mongoose"
import { ConversationSchema, type ConversationDocument } from "./document"

export type { ConversationDocument }

export const Conversation =
  (mongoose.models.Conversation as mongoose.Model<ConversationDocument>) ||
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema)
