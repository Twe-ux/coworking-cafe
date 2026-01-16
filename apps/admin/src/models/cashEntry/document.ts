import { Document, Schema } from "mongoose";

interface CashEntryItem {
  label: string;
  value: number;
}

/** Document of a {@link CashEntry}, as stored in the database. */
export interface CashEntryDocument extends Omit<Document, "_id"> {
  _id: string;
  prestaB2B?: CashEntryItem[];
  depenses?: CashEntryItem[];
  virement?: number;
  especes?: number;
  cbClassique?: number;
  cbSansContact?: number;
}

/** Schema used to validate CashEntry objects for the database. */
export const CashEntrySchema = new Schema<CashEntryDocument>({
  _id: {
    type: String,
    match: /^\d{4}\/\d{2}\/\d{2}$/,
    required: true,
  },
  prestaB2B: {
    type: [
      {
        label: { type: String },
        value: { type: Number },
      },
    ],
    default: undefined,
    required: false,
  },
  depenses: {
    type: [
      {
        label: { type: String },
        value: { type: Number },
      },
    ],
    default: undefined,
    required: false,
  },
  virement: { type: Number, required: false, default: 0 },
  especes: { type: Number, required: false, default: 0 },
  cbClassique: { type: Number, required: false, default: 0 },
  cbSansContact: { type: Number, required: false, default: 0 },
});

// Indexes
CashEntrySchema.index({ _id: 1 }, { unique: true });
