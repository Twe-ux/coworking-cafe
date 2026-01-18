import { Schema, model, models, Document } from 'mongoose';

/**
 * Interface pour les push subscriptions
 */
export interface PushSubscriptionDocument extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string; // ID de l'utilisateur (optionnel)
  userAgent?: string; // User agent du navigateur
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema Mongoose pour les push subscriptions
 */
const PushSubscriptionSchema = new Schema<PushSubscriptionDocument>(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
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
    userId: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour rechercher par endpoint
PushSubscriptionSchema.index({ endpoint: 1 });
PushSubscriptionSchema.index({ userId: 1 });

/**
 * Model Mongoose pour les push subscriptions
 */
export const PushSubscription =
  models.PushSubscription || model<PushSubscriptionDocument>('PushSubscription', PushSubscriptionSchema);
