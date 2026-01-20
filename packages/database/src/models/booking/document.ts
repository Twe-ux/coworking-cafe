import { Document, Schema, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type ReservationType = "hourly" | "daily" | "weekly" | "monthly";

export interface BookingDocument extends Document {
  spaceId: Types.ObjectId;
  spaceName?: string;
  clientId: Types.ObjectId;
  clientName?: string;
  clientEmail?: string;
  reservationType: ReservationType;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  status: BookingStatus;
  totalPrice: number;
  depositPaid?: number;
  notes?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BookingSchema = new Schema<BookingDocument>(
  {
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: "SpaceConfiguration",
      required: true,
    },
    spaceName: {
      type: String,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: {
      type: String,
    },
    clientEmail: {
      type: String,
    },
    reservationType: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    depositPaid: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherches fréquentes
BookingSchema.index({ spaceId: 1, startDate: 1 });
BookingSchema.index({ clientId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ startDate: 1, endDate: 1 });
