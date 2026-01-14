import mongoose, { Schema, Model } from 'mongoose';
import { PromoConfigDocument } from './document';

const PromoConfigSchema = new Schema<PromoConfigDocument>(
  {
    current: {
      code: { type: String, required: true },
      token: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      discount_type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_item'],
        required: true
      },
      discount_value: { type: Number, required: true },
      valid_from: { type: Date, required: true },
      valid_until: { type: Date, required: true },
      max_uses: { type: Number, default: 0 },
      current_uses: { type: Number, default: 0 },
      is_active: { type: Boolean, default: true },
      created_at: { type: Date, default: Date.now }
    },

    history: [{
      code: { type: String, required: true },
      token: { type: String, required: true },
      description: { type: String, required: true },
      discount_type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_item'],
        required: true
      },
      discount_value: { type: Number, required: true },
      valid_from: { type: Date, required: true },
      valid_until: { type: Date, required: true },
      total_uses: { type: Number, default: 0 },
      deactivated_at: { type: Date, required: true }
    }],

    stats: {
      total_views: { type: Number, default: 0 },
      total_copies: { type: Number, default: 0 },
      views_today: { type: Number, default: 0 },
      copies_today: { type: Number, default: 0 }
    },

    scan_stats: {
      total_scans: { type: Number, default: 0 },
      total_reveals: { type: Number, default: 0 },
      total_copies: { type: Number, default: 0 },
      conversion_rate_reveal: { type: Number, default: 0 },
      conversion_rate_copy: { type: Number, default: 0 },
      scans_by_day: { type: Map, of: Number, default: {} },
      scans_by_hour: { type: Map, of: Number, default: {} },
      average_time_to_reveal: { type: Number, default: 0 }
    },

    marketing: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      image_url: { type: String },
      cta_text: { type: String, required: true }
    },

    events: [{
      timestamp: { type: Date, required: true },
      type: { type: String, enum: ['scan', 'reveal', 'copy'], required: true },
      session_id: { type: String, required: true }
    }]
  },
  {
    timestamps: true,
    collection: 'promo_config'
  }
);

// Index pour les recherches par token
PromoConfigSchema.index({ 'current.token': 1 });

// Il n'y aura qu'un seul document de config
const PromoConfig: Model<PromoConfigDocument> =
  mongoose.models.PromoConfig || mongoose.model<PromoConfigDocument>('PromoConfig', PromoConfigSchema);

export default PromoConfig;
export { PromoConfigSchema };
export type { PromoConfigDocument };
