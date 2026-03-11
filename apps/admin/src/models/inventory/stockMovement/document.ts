import { Schema, Document, Types } from 'mongoose'

export type MovementType = 'inventory_adjustment' | 'purchase_reception' | 'manual' | 'loss' | 'direct_purchase'

/** Document of a StockMovement, as stored in the database. */
export interface StockMovementDocument extends Document {
  productId: Types.ObjectId
  type: MovementType
  quantity: number
  unitPriceHT: number // Prix unitaire HT au moment du mouvement
  totalValue: number // quantity × unitPriceHT
  date: Date
  reference?: string
  notes?: string
  createdBy: string // User/Employee ID (string, pas ObjectId)
  createdAt: Date
}

/** Schema used to validate StockMovement objects for the database. */
export const StockMovementSchema = new Schema<StockMovementDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    type: {
      type: String,
      enum: ['inventory_adjustment', 'purchase_reception', 'manual', 'loss', 'direct_purchase'],
      required: [true, 'Movement type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      validate: {
        validator: (v: number) => v !== 0,
        message: 'Quantity cannot be zero',
      },
    },
    unitPriceHT: {
      type: Number,
      required: [true, 'Unit price HT is required'],
      min: [0, 'Unit price must be positive'],
    },
    totalValue: {
      type: Number,
      required: [true, 'Total value is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Creator reference is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
StockMovementSchema.index({ productId: 1, date: -1 })
StockMovementSchema.index({ type: 1 })
StockMovementSchema.index({ date: -1 })
StockMovementSchema.index({ type: 1, date: -1 }) // Compound index for analytics queries
StockMovementSchema.index({ reference: 1 })
StockMovementSchema.index({ createdBy: 1 })
