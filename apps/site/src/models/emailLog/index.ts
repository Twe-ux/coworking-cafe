import mongoose from "mongoose";
import { EmailLogDocument, EmailLogSchema } from "./document";

export const EmailLog =
  (mongoose.models.EmailLog as mongoose.Model<EmailLogDocument>) ||
  mongoose.model<EmailLogDocument>("EmailLog", EmailLogSchema);

export type { EmailLogDocument };
