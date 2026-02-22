import { Schema, Types, Document } from "mongoose";

export type RegistrationStatus = "pending" | "confirmed" | "cancelled";

/** Document of an {@link EventRegistration}, as stored in the database. */
export interface EventRegistrationDocument extends Document {
  eventId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  status: RegistrationStatus;
  registeredAt: string; // YYYY-MM-DD format
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate EventRegistration objects for the database. */
export const EventRegistrationSchema = new Schema<EventRegistrationDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [100, "First name cannot exceed 100 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [100, "Last name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "confirmed", "cancelled"],
        message: "{VALUE} is not a valid registration status",
      },
      default: "pending",
    },
    registeredAt: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
EventRegistrationSchema.index({ eventId: 1, status: 1 });
EventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
EventRegistrationSchema.index({ email: 1 });
EventRegistrationSchema.index({ registeredAt: -1 });
