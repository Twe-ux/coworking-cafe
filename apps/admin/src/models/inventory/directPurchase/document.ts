import { Schema, Document, Types } from 'mongoose'

export interface DirectPurchaseItemDoc {
  productId: Types.ObjectId
  productName: string
  quantity: number
  packagingType: 'pack' | 'unit'
  unitPriceHT: number
  totalHT: number
  vatRate: number
  totalTTC: number
  unitsPerPackage?: number
}

/** Document of a DirectPurchase, as stored in the database. */
export interface DirectPurchaseDocument extends Document {
  purchaseNumber: string
  supplier: string
  items: DirectPurchaseItemDoc[]
  totalHT: number
  totalTTC: number
  date: Date
  invoiceNumber?: string
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const DirectPurchaseItemSchema = new Schema<DirectPurchaseItemDoc>(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    packagingType: {
      type: String,
      required: [true, 'Packaging type is required'],
      enum: ['pack', 'unit'],
    },
    unitPriceHT: {
      type: Number,
      required: [true, 'Unit price HT is required'],
      min: [0, 'Unit price must be positive'],
    },
    totalHT: {
      type: Number,
      required: [true, 'Total HT is required'],
      min: [0, 'Total HT must be positive'],
    },
    vatRate: {
      type: Number,
      required: [true, 'VAT rate is required'],
    },
    totalTTC: {
      type: Number,
      required: [true, 'Total TTC is required'],
      min: [0, 'Total TTC must be positive'],
    },
    unitsPerPackage: {
      type: Number,
      min: 1,
    },
  },
  { _id: false }
)

/** Schema used to validate DirectPurchase objects for the database. */
export const DirectPurchaseSchema = new Schema<DirectPurchaseDocument>(
  {
    purchaseNumber: {
      type: String,
      required: [true, 'Purchase number is required'],
      trim: true,
    },
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    items: {
      type: [DirectPurchaseItemSchema],
      required: [true, 'Items are required'],
      validate: {
        validator: (v: DirectPurchaseItemDoc[]) => v.length > 0,
        message: 'At least one item must be provided',
      },
    },
    totalHT: { type: Number, required: true, min: 0, default: 0 },
    totalTTC: { type: Number, required: true, min: 0, default: 0 },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    invoiceNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
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
DirectPurchaseSchema.index({ purchaseNumber: 1 }, { unique: true })
DirectPurchaseSchema.index({ supplier: 1 })
DirectPurchaseSchema.index({ date: -1 })
DirectPurchaseSchema.index({ createdAt: -1 })
