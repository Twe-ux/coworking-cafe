import { Schema, Document, Types } from "mongoose"

export type ProductCategory = "food" | "cleaning"
export type ProductUnit = "kg" | "L" | "unit" | "pack"

/** Document of a Product, as stored in the database. */
export interface ProductDocument extends Document {
  name: string
  category: ProductCategory
  unit: ProductUnit
  unitPriceHT: number
  vatRate: number
  supplierId: Types.ObjectId
  minStock: number
  maxStock: number
  currentStock: number
  hasShortDLC: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/** Schema used to validate Product objects for the database. */
export const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["food", "cleaning"],
      required: [true, "Category is required"],
    },
    unit: {
      type: String,
      enum: ["kg", "L", "unit", "pack"],
      required: [true, "Unit is required"],
    },
    unitPriceHT: {
      type: Number,
      required: [true, "Unit price HT is required"],
      min: 0,
    },
    vatRate: {
      type: Number,
      required: [true, "VAT rate is required"],
      enum: [5.5, 20],
    },
    supplierId: {
      type: Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier reference is required"],
    },
    minStock: {
      type: Number,
      required: [true, "Minimum stock is required"],
      min: 0,
      default: 0,
    },
    maxStock: {
      type: Number,
      required: [true, "Maximum stock is required"],
      min: 0,
      validate: {
        validator: function (this: ProductDocument, v: number) {
          return v >= this.minStock
        },
        message: "Maximum stock must be greater than or equal to minimum stock",
      },
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    hasShortDLC: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
ProductSchema.index({ name: 1 })
ProductSchema.index({ supplierId: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ currentStock: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ hasShortDLC: 1 })
