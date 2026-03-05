import { Schema, Document } from "mongoose"

/** Document of a Supplier, as stored in the database. */
export interface SupplierDocument extends Document {
  name: string
  contact: string
  email: string
  phone?: string
  categories: ("food" | "cleaning" | "emballage" | "papeterie" | "divers")[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/** Schema used to validate Supplier objects for the database. */
export const SupplierSchema = new Schema<SupplierDocument>(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      enum: ["food", "cleaning", "emballage", "papeterie", "divers"],
      required: [true, "At least one category is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one category must be provided",
      },
    },
    notes: {
      type: String,
      trim: true,
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
SupplierSchema.index({ name: 1 })
SupplierSchema.index({ email: 1 })
SupplierSchema.index({ isActive: 1 })
SupplierSchema.index({ categories: 1 })
