import mongoose from 'mongoose';
import { ContactMailSchema, ContactMailDocument } from './document';

/**
 * Model Mongoose pour ContactMail
 */
export const ContactMail =
  (mongoose.models.ContactMail as mongoose.Model<ContactMailDocument>) ||
  mongoose.model<ContactMailDocument>('ContactMail', ContactMailSchema);

export type { ContactMailDocument };
