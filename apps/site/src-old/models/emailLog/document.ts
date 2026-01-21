import { Schema, Document, Types } from "mongoose";

/** Document of an {@link EmailLog}, as stored in the database. */
export interface EmailLogDocument extends Document {
  type:
    | "contact_notification"
    | "contact_reply"
    | "reservation_confirmation"
    | "reservation_reminder"
    | "newsletter"
    | "promo";
  to: string;
  from: string;
  subject: string;
  status: "sent" | "failed";
  error?: string;
  relatedModel?: "ContactMail" | "Reservation" | "Newsletter" | "Promo";
  relatedId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate EmailLog objects for the database. */
export const EmailLogSchema = new Schema<EmailLogDocument>(
  {
    type: {
      type: String,
      enum: [
        "contact_notification",
        "contact_reply",
        "reservation_confirmation",
        "reservation_reminder",
        "newsletter",
        "promo"
      ],
      required: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },
    error: {
      type: String,
      trim: true,
    },
    relatedModel: {
      type: String,
      enum: ["ContactMail", "Reservation", "Newsletter", "Promo"],
    },
    relatedId: {
      type: Types.ObjectId,
      refPath: "relatedModel",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
EmailLogSchema.index({ type: 1 });
EmailLogSchema.index({ to: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ relatedModel: 1, relatedId: 1 });
EmailLogSchema.index({ sentAt: -1 });
