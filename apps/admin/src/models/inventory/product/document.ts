import { Schema, Document, Types } from "mongoose"

/** Document of a Product, as stored in the database. */
export interface ProductDocument extends Document {
  name: string
  category: "food" | "cleaning" | "emballage" | "papeterie" | "divers"
  unit: "kg" | "L" | "unit" | "pack"
  unitPriceHT: number
  vatRate: number
  supplierId: Types.ObjectId
  supplierName?: string
  supplierReference?: string
  packagingType: "pack" | "unit" | "kg" | "L"
  unitsPerPackage: number
  packagingDescription?: string
  minStockUnit: "package" | "unit"
  order: number
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
      enum: ["food", "cleaning", "emballage", "papeterie", "divers"],
      required: [true, "Category is required"],
    },
    unit: {
      type: String,
      enum: ["kg", "L", "unit", "pack"],
      required: [true, "Unit is required"],
    },
    unitPriceHT: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Price must be positive"],
    },
    vatRate: {
      type: Number,
      required: [true, "VAT rate is required"],
      min: [0, "VAT rate must be positive"],
      max: [100, "VAT rate cannot exceed 100%"],
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    supplierName: {
      type: String,
      trim: true,
    },
    supplierReference: {
      type: String,
      trim: true,
    },
    packagingType: {
      type: String,
      enum: ["pack", "unit", "kg", "L"],
      default: "unit",
    },
    unitsPerPackage: {
      type: Number,
      default: 1,
      min: [1, "Units per package must be at least 1"],
    },
    packagingDescription: {
      type: String,
      trim: true,
    },
    minStockUnit: {
      type: String,
      enum: ["package", "unit"],
      default: "unit",
    },
    order: {
      type: Number,
      default: 0,
    },
    minStock: {
      type: Number,
      required: [true, "Minimum stock is required"],
      min: [0, "Minimum stock must be positive"],
    },
    maxStock: {
      type: Number,
      required: [true, "Maximum stock is required"],
      min: [0, "Maximum stock must be positive"],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, "Current stock cannot be negative"],
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
ProductSchema.index({ category: 1 })
ProductSchema.index({ supplierId: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ currentStock: 1, minStock: 1 }) // For low stock queries

// Validation: minStock must be less than maxStock
ProductSchema.pre("save", function (next) {
  if (this.minStock >= this.maxStock) {
    next(new Error("Minimum stock must be less than maximum stock"))
  } else {
    next()
  }
})
