import { Schema, Document } from 'mongoose';

/**
 * Cash Count Details Interface
 * Stores breakdown of bills and coins counted
 */
export interface CashCountDetails {
  bills: Array<{
    value: number;
    quantity: number;
  }>;
  coins: Array<{
    value: number;
    quantity: number;
  }>;
}

/**
 * Counted By Interface
 * Stores information about who counted the cash register
 */
export interface CountedBy {
  userId: string;
  name: string;
}

/**
 * CashRegister Document Interface
 * Tracks daily cash register counts
 */
export interface CashRegisterDocument extends Document {
  date: string;
  amount: number;
  countedBy: CountedBy;
  countDetails?: CashCountDetails;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CashRegister Schema
 * Used for tracking daily cash register amounts
 */
export const CashRegisterSchema = new Schema<CashRegisterDocument>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    countedBy: {
      userId: {
        type: String,
        required: [true, 'User ID is required'],
      },
      name: {
        type: String,
        required: [true, 'User name is required'],
      },
    },
    countDetails: {
      bills: [
        {
          value: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      coins: [
        {
          value: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
CashRegisterSchema.index({ date: -1 }); // Most recent first
CashRegisterSchema.index({ date: 1, createdAt: 1 }); // Multiple entries per day support
