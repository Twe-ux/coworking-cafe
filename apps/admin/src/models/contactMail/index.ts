import mongoose from "mongoose";
import { ContactMailDocument, ContactMailSchema } from "./document";

export const ContactMail =
  (mongoose.models.ContactMail as mongoose.Model<ContactMailDocument>) ||
  mongoose.model<ContactMailDocument>("ContactMail", ContactMailSchema);

export type { ContactMailDocument };
