import { Schema, Document, Types } from 'mongoose';
import type { ContactMailStatus } from '@/types/contactMail';

/**
 * Interface Mongoose pour ContactMail
 */
export interface ContactMailDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMailStatus;
  reply?: string;
  repliedAt?: Date;
  repliedBy?: Types.ObjectId;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour ContactMail
 */
export const ContactMailSchema = new Schema<ContactMailDocument>(
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
      enum: ['unread', 'read', 'replied', 'archived'] as ContactMailStatus[],
      default: 'unread',
    },
    reply: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
