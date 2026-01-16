import { Document, Schema } from "mongoose";

interface VATData {
  "total-ht": number;
  "total-ttc": number;
  "total-taxes": number;
}

/** Document of a {@link Turnover}, as stored in the database. */
export interface TurnoverDocument extends Omit<Document, '_id'> {
  _id: string;
  "vat-20": VATData;
  "vat-10": VATData;
  "vat-55": VATData;
  "vat-0": VATData;
}

/** Schema used to validate Turnover objects for the database. */
export const TurnoverSchema = new Schema<TurnoverDocument>({
  _id: { type: String, required: true },
  "vat-20": {
    "total-ht": { type: Number, required: true },
    "total-ttc": { type: Number, required: true },
    "total-taxes": { type: Number, required: true },
  },
  "vat-10": {
    "total-ht": { type: Number, required: true },
    "total-ttc": { type: Number, required: true },
    "total-taxes": { type: Number, required: true },
  },
  "vat-55": {
    "total-ht": { type: Number, required: true },
    "total-ttc": { type: Number, required: true },
    "total-taxes": { type: Number, required: true },
  },
  "vat-0": {
    "total-ht": { type: Number, required: true },
    "total-ttc": { type: Number, required: true },
    "total-taxes": { type: Number, required: true },
  },
});

// Indexes
// Add indexes here if needed in the future
