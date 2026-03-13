import { Schema, Document, Types } from "mongoose"

export interface DLCAlertConfig {
  enabled: boolean
  days: number[] // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  time: string // Format "HH:mm"
}

/** Document of a Product, as stored in the database. */
export interface ProductDocument extends Document {
  name: string
  category: "food" | "cleaning" | "emballage" | "papeterie" | "divers"
  unitPriceHT: number
  vatRate: number
  supplierId: Types.ObjectId
  supplierName?: string
  supplierReference?: string
  packagingType: "pack" | "unit"
  priceType: "unit" | "pack"
  unitsPerPackage: number
  packageUnit?: "kg" | "L" | "unit"
  packagingDescription?: string
  minStock: number
  maxStock: number
  currentStock: number
  hasShortDLC: boolean
  dlcAlertConfig?: DLCAlertConfig
  isActive: boolean
  outOfStockHandledAt?: Date // Date de traitement de la rupture (dans commande/achat)
  purchaseMarked?: boolean // Indicateur visuel "marqué pour achat" (checkbox)
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
      enum: ["pack", "unit"],
      default: "unit",
    },
    priceType: {
      type: String,
      enum: ["unit", "pack"],
      default: "unit",
    },
    unitsPerPackage: {
      type: Number,
      default: 1,
      min: [1, "Units per package must be at least 1"],
    },
    packageUnit: {
      type: String,
      enum: ["kg", "L", "unit"],
    },
    packagingDescription: {
      type: String,
      trim: true,
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
    dlcAlertConfig: {
      type: {
        enabled: { type: Boolean, default: false },
        days: {
          type: [Number],
          validate: {
            validator: (v: number[]) =>
              v.every((day) => day >= 0 && day <= 6),
            message: "Days must be between 0 (Sunday) and 6 (Saturday)",
          },
        },
        time: {
          type: String,
          validate: {
            validator: (v: string) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: "Time must be in HH:mm format (00:00 to 23:59)",
          },
        },
      },
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    outOfStockHandledAt: {
      type: Date,
      required: false,
    },
    purchaseMarked: {
      type: Boolean,
      default: false,
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
