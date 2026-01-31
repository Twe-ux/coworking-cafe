import { Schema, Document } from 'mongoose';

/**
 * Interface pour une subscription push
 */
export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour le document Mongoose
 */
export interface PushSubscriptionDocument extends Document, IPushSubscription {}

/**
 * Schéma Mongoose pour les push subscriptions
 */
export const PushSubscriptionSchema = new Schema<PushSubscriptionDocument>(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'pushsubscriptions', // Nom existant en prod (créé automatiquement par Mongoose)
  }
);

// Index pour recherche rapide
PushSubscriptionSchema.index({ endpoint: 1 });
