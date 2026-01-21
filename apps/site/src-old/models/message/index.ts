import mongoose from "mongoose";
import { MessageDocument } from "./document";
import messageSchema from "./schema";

export * from "./document";

const Message =
  (mongoose.models.Message as mongoose.Model<MessageDocument>) ||
  mongoose.model<MessageDocument>("Message", messageSchema);

export default Message;
