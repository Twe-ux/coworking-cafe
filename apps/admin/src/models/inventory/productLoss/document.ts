import { Schema, Document, Types } from 'mongoose'

export type LossReason = 'expiration' | 'damage' | 'theft' | 'error' | 'other'

/** Document of a ProductLoss, as stored in the database. */
export interface ProductLossDocument extends Document {
  productId: Types.ObjectId
  productName: string
  quantity: number
  reason: LossReason
  notes?: string
  unitPriceHT: number // CUMP at the time of loss
  totalValue: number // quantity × unitPriceHT
  date: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/** Schema used to validate ProductLoss objects for the database. */
export const ProductLossSchema = new Schema<ProductLossDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    reason: {
      type: String,
      enum: ['expiration', 'damage', 'theft', 'error', 'other'],
      required: [true, 'Loss reason is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    unitPriceHT: {
      type: Number,
      required: [true, 'Unit price HT is required'],
      min: [0, 'Unit price must be positive'],
    },
    totalValue: {
      type: Number,
      required: [true, 'Total value is required'],
      min: [0, 'Total value must be positive'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: [true, 'Creator reference is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
ProductLossSchema.index({ productId: 1, date: -1 })
ProductLossSchema.index({ date: -1 })
ProductLossSchema.index({ reason: 1 })
ProductLossSchema.index({ createdBy: 1 })
