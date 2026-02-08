import { Schema, Types, Document } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethodType =
  | "card"
  | "cash"
  | "bank-transfer"
  | "wallet";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

export interface PaymentMetadata {
  cardBrand?: CardBrand;
  cardLast4?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  receiptUrl?: string;
  receiptNumber?: string;
  refundReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
}

/** Document of a {@link Payment}, as stored in the database. */
export interface PaymentDocument extends Document {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeCustomerId?: string;
  stripeRefundId?: string;
  metadata?: PaymentMetadata;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

/** Schema used to validate Payment objects for the database. */
export const PaymentSchema = new Schema<PaymentDocument>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "EUR",
      maxlength: 3,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "cash", "bank-transfer", "wallet"],
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      // unique sparse index defined explicitly below
    },
    stripeChargeId: { type: String, trim: true, sparse: true },
    stripeCustomerId: { type: String, trim: true, index: true },
    stripeRefundId: { type: String, trim: true, sparse: true },
    metadata: {
      cardBrand: {
        type: String,
        enum: [
          "visa",
          "mastercard",
          "amex",
          "discover",
          "diners",
          "jcb",
          "unionpay",
          "unknown",
        ],
      },
      cardLast4: { type: String, trim: true, maxlength: 4 },
      cardExpiryMonth: { type: Number, min: 1, max: 12 },
      cardExpiryYear: { type: Number, min: 2024 },
      receiptUrl: { type: String, trim: true },
      receiptNumber: { type: String, trim: true },
      refundReason: { type: String, trim: true, maxlength: 500 },
      refundedAmount: { type: Number, min: 0 },
      refundedAt: { type: Date },
    },
    description: { type: String, trim: true, maxlength: 500 },
    failureReason: { type: String, trim: true, maxlength: 500 },
    completedAt: { type: Date },
    failedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ booking: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index(
  { stripePaymentIntentId: 1 },
  { sparse: true, unique: true }
);
