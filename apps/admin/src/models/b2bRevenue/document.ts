import { Document, Schema } from "mongoose";

/** Document of a {@link B2BRevenue}, as stored in the database. */
export interface B2BRevenueDocument extends Omit<Document, "_id"> {
  _id: string;
  date: string;
  ht: number;
  ttc: number;
  tva: number;
  notes?: string;
}

/** Schema used to validate B2BRevenue objects for the database. */
export const B2BRevenueSchema = new Schema<B2BRevenueDocument>(
  {
    _id: {
      type: String,
      match: /^\d{4}\/\d{2}\/\d{2}$/,
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    ht: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ttc: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tva: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'b2brevenues',
  }
);

// Indexes
B2BRevenueSchema.index({ _id: 1 }, { unique: true });
B2BRevenueSchema.index({ date: 1 });
