import mongoose from 'mongoose';
import { PushSubscriptionSchema, PushSubscriptionDocument } from './document';

/**
 * Model PushSubscription
 * Stocke les subscriptions push pour les notifications PWA
 */
export const PushSubscription =
  (mongoose.models.PushSubscription as mongoose.Model<PushSubscriptionDocument>) ||
  mongoose.model<PushSubscriptionDocument>('PushSubscription', PushSubscriptionSchema);

// Export types
export type { IPushSubscription, PushSubscriptionDocument } from './document';
