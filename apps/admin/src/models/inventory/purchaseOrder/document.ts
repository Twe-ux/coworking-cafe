import { Schema, Document, Types } from 'mongoose'

export type OrderStatus = 'draft' | 'validated' | 'sent' | 'received'

export interface PurchaseOrderItem {
  productId: Types.ObjectId
  productName: string
  quantity: number
  packagingType: 'pack' | 'unit' | 'kg' | 'L'
  unitPriceHT: number
  totalHT: number
  vatRate: number
  totalTTC: number
}

/** Document of a PurchaseOrder, as stored in the database. */
export interface PurchaseOrderDocument extends Document {
  orderNumber: string
  supplierId: Types.ObjectId
  supplierName: string
  items: PurchaseOrderItem[]
  status: OrderStatus
  totalHT: number
  totalTTC: number
  createdBy: string
  validatedBy?: string
  validatedAt?: Date
  sentAt?: Date
  receivedAt?: Date
  receivedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const PurchaseOrderItemSchema = new Schema<PurchaseOrderItem>(
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
      min: 0.01,
    },
    packagingType: {
      type: String,
      required: [true, 'Packaging type is required'],
      enum: ['kg', 'L', 'unit', 'pack'],
    },
    unitPriceHT: {
      type: Number,
      required: [true, 'Unit price HT is required'],
      min: 0,
    },
    totalHT: {
      type: Number,
      required: [true, 'Total HT is required'],
      min: 0,
    },
    vatRate: {
      type: Number,
      required: [true, 'VAT rate is required'],
    },
    totalTTC: {
      type: Number,
      required: [true, 'Total TTC is required'],
      min: 0,
    },
  },
  { _id: false }
)

/** Schema used to validate PurchaseOrder objects for the database. */
export const PurchaseOrderSchema = new Schema<PurchaseOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      trim: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required'],
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    items: {
      type: [PurchaseOrderItemSchema],
      required: [true, 'Items are required'],
      validate: {
        validator: (v: PurchaseOrderItem[]) => v.length > 0,
        message: 'At least one item must be provided',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'validated', 'sent', 'received'],
      default: 'draft',
    },
    totalHT: { type: Number, required: true, min: 0, default: 0 },
    totalTTC: { type: Number, required: true, min: 0, default: 0 },
    createdBy: { type: String, trim: true },
    validatedBy: { type: String, trim: true },
    validatedAt: { type: Date },
    sentAt: { type: Date },
    receivedAt: { type: Date },
    receivedBy: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
PurchaseOrderSchema.index({ orderNumber: 1 }, { unique: true })
PurchaseOrderSchema.index({ supplierId: 1 })
PurchaseOrderSchema.index({ status: 1 })
PurchaseOrderSchema.index({ createdAt: -1 })
