import { Schema, Document, Types } from "mongoose";

/** Document of a {@link Newsletter}, as stored in the database. */
export interface NewsletterDocument extends Document {
  email: string;
  userId?: Types.ObjectId;
  isSubscribed: boolean;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  source: "form" | "registration";
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Newsletter objects for the database. */
export const NewsletterSchema = new Schema<NewsletterDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["form", "registration"],
      default: "form",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
NewsletterSchema.index({ email: 1 }, { unique: true });
NewsletterSchema.index({ userId: 1 });
NewsletterSchema.index({ isSubscribed: 1 });
