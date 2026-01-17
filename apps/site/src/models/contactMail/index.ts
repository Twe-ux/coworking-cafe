import mongoose from 'mongoose';
import { Schema } from 'mongoose';

/**
 * Interface Mongoose pour ContactMail (apps/site - API publique uniquement)
 */
interface ContactMailDocument extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour ContactMail
 */
const ContactMailSchema = new Schema<ContactMailDocument>(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Email invalide',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Le sujet est requis'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Le message est requis'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes pour optimiser les recherches
ContactMailSchema.index({ email: 1 });
ContactMailSchema.index({ status: 1 });
ContactMailSchema.index({ createdAt: -1 });

/**
 * Export du model ContactMail
 * Utilise le model existant si déjà initialisé (pour éviter les erreurs en dev)
 */
export const ContactMail =
  (mongoose.models.ContactMail as mongoose.Model<ContactMailDocument>) ||
  mongoose.model<ContactMailDocument>('ContactMail', ContactMailSchema);
