import { Schema, Document } from "mongoose";

/** Document of an {@link AdditionalService}, as stored in the database. */
export interface AdditionalServiceDocument extends Document {
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate AdditionalService objects for the database. */
export const AdditionalServiceSchema = new Schema<AdditionalServiceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AdditionalServiceSchema.index({ name: 1 });
AdditionalServiceSchema.index({ isActive: 1 });
