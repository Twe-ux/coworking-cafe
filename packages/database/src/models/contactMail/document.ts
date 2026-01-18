import { Schema, model, models, Document } from 'mongoose';

export interface IContactMail extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

const contactMailSchema = new Schema<IContactMail>(
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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Si vide, c'est valide (champ optionnel)
          if (!v) return true;
          // Regex pour formats français : 0612345678, 06 12 34 56 78, +33612345678, +33 6 12 34 56 78
          return /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})$/.test(v);
        },
        message: 'Format de téléphone invalide. Formats acceptés : 0612345678, 06 12 34 56 78, +33612345678'
      }
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
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
contactMailSchema.index({ status: 1, createdAt: -1 });
contactMailSchema.index({ email: 1 });

export const ContactMail =
  models.ContactMail || model<IContactMail>('ContactMail', contactMailSchema);
