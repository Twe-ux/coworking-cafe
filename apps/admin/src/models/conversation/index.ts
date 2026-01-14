import mongoose from "mongoose";
import { ConversationDocument } from "./document";
import conversationSchema from "./schema";

export * from "./document";

const Conversation =
  (mongoose.models.Conversation as mongoose.Model<ConversationDocument>) ||
  mongoose.model<ConversationDocument>("Conversation", conversationSchema);

export default Conversation;
