import { ObjectId, Schema, Types, Document } from "mongoose";

/** Payment status */
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded" | "cancelled";

/** Payment method */
export type PaymentMethodType = "card" | "cash" | "bank-transfer" | "wallet";

/** Card brand */
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "diners" | "jcb" | "unionpay" | "unknown";

/** Payment metadata for storing additional information */
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
  booking: ObjectId;
  user: ObjectId;
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
      type: Types.ObjectId,
      ref: "Reservation",
      required: [true, "Booking reference is required"],
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "EUR",
      maxlength: [3, "Currency code must be 3 characters"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "processing", "succeeded", "failed", "refunded", "cancelled"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["card", "cash", "bank-transfer", "wallet"],
        message: "{VALUE} is not a valid payment method",
      },
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeChargeId: {
      type: String,
      trim: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      trim: true,
      index: true,
    },
    stripeRefundId: {
      type: String,
      trim: true,
      sparse: true,
    },
    metadata: {
      cardBrand: {
        type: String,
        enum: {
          values: ["visa", "mastercard", "amex", "discover", "diners", "jcb", "unionpay", "unknown"],
          message: "{VALUE} is not a valid card brand",
        },
      },
      cardLast4: {
        type: String,
        trim: true,
        maxlength: 4,
      },
      cardExpiryMonth: {
        type: Number,
        min: 1,
        max: 12,
      },
      cardExpiryYear: {
        type: Number,
        min: 2024,
      },
      receiptUrl: {
        type: String,
        trim: true,
      },
      receiptNumber: {
        type: String,
        trim: true,
      },
      refundReason: {
        type: String,
        trim: true,
        maxlength: [500, "Refund reason cannot exceed 500 characters"],
      },
      refundedAmount: {
        type: Number,
        min: 0,
      },
      refundedAt: {
        type: Date,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [500, "Failure reason cannot exceed 500 characters"],
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and performance
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ booking: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true, unique: true });
