import { Schema, Document, Types } from "mongoose"

export type MovementType = "inventory_adjustment" | "purchase_reception" | "manual"

/** Document of a StockMovement, as stored in the database. */
export interface StockMovementDocument extends Document {
  productId: Types.ObjectId
  type: MovementType
  quantity: number
  date: Date
  reference?: string
  notes?: string
  createdBy: Types.ObjectId
  createdAt: Date
}

/** Schema used to validate StockMovement objects for the database. */
export const StockMovementSchema = new Schema<StockMovementDocument>(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    type: {
      type: String,
      enum: ["inventory_adjustment", "purchase_reception", "manual"],
      required: [true, "Movement type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      validate: {
        validator: (v: number) => v !== 0,
        message: "Quantity cannot be zero",
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
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
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
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
StockMovementSchema.index({ reference: 1 })
StockMovementSchema.index({ createdBy: 1 })
