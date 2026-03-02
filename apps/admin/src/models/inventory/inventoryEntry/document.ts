import { Schema, Document, Types } from 'mongoose'

export type InventoryType = 'monthly' | 'weekly'

export interface InventoryEntryItem {
  productId: Types.ObjectId
  productName: string
  theoreticalQty: number
  actualQty: number
  variance: number
  varianceValue: number
  unitPriceHT: number
}

/** Document of an InventoryEntry, as stored in the database. */
export interface InventoryEntryDocument extends Document {
  date: Date
  type: InventoryType
  items: InventoryEntryItem[]
  totalVarianceValue: number

  // Auth flexible : admin OU staff PIN (pas de ref ObjectId)
  createdBy?: string // User/Employee ID (string, pas ObjectId)
  staffPinUsed?: string // Code PIN hashé
  staffName?: string // Nom staff (denormalized)

  taskId?: string // Linked task ID (from Tasks system)

  status: 'draft' | 'finalized'
  finalizedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const InventoryEntryItemSchema = new Schema<InventoryEntryItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
    },
    theoreticalQty: {
      type: Number,
      required: [true, 'Theoretical quantity is required'],
      default: 0,
    },
    actualQty: {
      type: Number,
      required: [true, 'Actual quantity is required'],
      default: 0,
    },
    variance: {
      type: Number,
      required: [true, 'Variance is required'],
      default: 0,
    },
    varianceValue: {
      type: Number,
      required: [true, 'Variance value is required'],
      default: 0,
    },
    unitPriceHT: {
      type: Number,
      required: [true, 'Unit price HT is required'],
      min: 0,
    },
  },
  { _id: false }
)

/** Schema used to validate InventoryEntry objects for the database. */
export const InventoryEntrySchema = new Schema<InventoryEntryDocument>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    type: {
      type: String,
      enum: ['monthly', 'weekly'],
      required: [true, 'Inventory type is required'],
    },
    items: {
      type: [InventoryEntryItemSchema],
      required: [true, 'Items are required'],
      validate: {
        validator: (v: InventoryEntryItem[]) => v.length > 0,
        message: 'At least one item must be provided',
      },
    },
    totalVarianceValue: {
      type: Number,
      required: [true, 'Total variance value is required'],
      default: 0,
    },

    // Auth flexible : admin OU staff PIN (pas de ref ObjectId)
    createdBy: {
      type: String,
      trim: true,
    },
    staffPinUsed: {
      type: String,
      trim: true,
    },
    staffName: {
      type: String,
      trim: true,
    },

    taskId: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['draft', 'finalized'],
      default: 'draft',
    },
    finalizedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
InventoryEntrySchema.index({ date: -1 })
InventoryEntrySchema.index({ type: 1 })
InventoryEntrySchema.index({ status: 1 })
InventoryEntrySchema.index({ createdBy: 1 })
InventoryEntrySchema.index({ staffName: 1 })
