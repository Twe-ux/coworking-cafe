import mongoose from "mongoose";
import { NewsletterDocument, NewsletterSchema } from "./document";

export const Newsletter =
  (mongoose.models.Newsletter as mongoose.Model<NewsletterDocument>) ||
  mongoose.model<NewsletterDocument>("Newsletter", NewsletterSchema);

export type { NewsletterDocument };
