import { Document, Schema, Types } from 'mongoose'

/**
 * PromoConfig Document Interface
 * Single document configuration for promo code system
 */
export interface PromoConfigDocument extends Document {
  _id: Types.ObjectId

  // Current active promo code
  current: {
    code: string
    token: string
    description: string
    discountType: 'percentage' | 'fixed' | 'free_item'
    discountValue: number
    validFrom: Date
    validUntil: Date
    maxUses: number
    currentUses: number
    isActive: boolean
    createdAt: Date
  }

  // Historical promo codes
  history: Array<{
    code: string
    token: string
    description: string
    discountType: 'percentage' | 'fixed' | 'free_item'
    discountValue: number
    validFrom: Date
    validUntil: Date
    totalUses: number
    deactivatedAt: Date
  }>

  // General stats
  stats: {
    totalViews: number
    totalCopies: number
    viewsToday: number
    copiesToday: number
  }

  // Detailed scan stats
  scanStats: {
    totalScans: number
    totalReveals: number
    totalCopies: number
    conversionRateReveal: number
    conversionRateCopy: number
    scansByDay: Map<string, number>
    scansByHour: Map<string, number>
    averageTimeToReveal: number
  }

  // Marketing content
  marketing: {
    title: string
    message: string
    imageUrl?: string
    ctaText: string
  }

  // Tracking events
  events: Array<{
    timestamp: Date
    type: 'scan' | 'reveal' | 'copy'
    sessionId: string
  }>

  createdAt: Date
  updatedAt: Date
}

/** Schema for PromoConfig */
export const PromoConfigSchema = new Schema<PromoConfigDocument>(
  {
    current: {
      code: { type: String, required: true },
      token: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'free_item'],
        required: true,
      },
      discountValue: { type: Number, required: true, min: 0 },
      validFrom: { type: Date, required: true },
      validUntil: { type: Date, required: true },
      maxUses: { type: Number, default: 0, min: 0 },
      currentUses: { type: Number, default: 0, min: 0 },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
    },

    history: [
      {
        code: { type: String, required: true },
        token: { type: String, required: true },
        description: { type: String, required: true },
        discountType: {
          type: String,
          enum: ['percentage', 'fixed', 'free_item'],
          required: true,
        },
        discountValue: { type: Number, required: true },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        totalUses: { type: Number, default: 0 },
        deactivatedAt: { type: Date, required: true },
      },
    ],

    stats: {
      totalViews: { type: Number, default: 0, min: 0 },
      totalCopies: { type: Number, default: 0, min: 0 },
      viewsToday: { type: Number, default: 0, min: 0 },
      copiesToday: { type: Number, default: 0, min: 0 },
    },

    scanStats: {
      totalScans: { type: Number, default: 0, min: 0 },
      totalReveals: { type: Number, default: 0, min: 0 },
      totalCopies: { type: Number, default: 0, min: 0 },
      conversionRateReveal: { type: Number, default: 0, min: 0, max: 100 },
      conversionRateCopy: { type: Number, default: 0, min: 0, max: 100 },
      scansByDay: { type: Map, of: Number, default: {} },
      scansByHour: { type: Map, of: Number, default: {} },
      averageTimeToReveal: { type: Number, default: 0, min: 0 },
    },

    marketing: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      imageUrl: { type: String },
      ctaText: { type: String, required: true },
    },

    events: [
      {
        timestamp: { type: Date, required: true },
        type: { type: String, enum: ['scan', 'reveal', 'copy'], required: true },
        sessionId: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'promo_config',
  }
)

// Indexes
// Note: current.token already has unique: true in schema, no need for separate index
PromoConfigSchema.index({ 'current.isActive': 1 })
PromoConfigSchema.index({ 'current.validFrom': 1, 'current.validUntil': 1 })
PromoConfigSchema.index({ 'events.timestamp': 1 })
