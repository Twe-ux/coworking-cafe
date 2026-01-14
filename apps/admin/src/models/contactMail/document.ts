import { Schema, Document, Types } from "mongoose";

/** Document of a {@link ContactMail}, as stored in the database. */
export interface ContactMailDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  reply?: string;
  repliedAt?: Date;
  repliedBy?: Types.ObjectId;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate ContactMail objects for the database. */
export const ContactMailSchema = new Schema<ContactMailDocument>(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse email valide"],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Le sujet est requis"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Le message est requis"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied", "archived"],
      default: "unread",
    },
    reply: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ContactMailSchema.index({ email: 1 });
ContactMailSchema.index({ status: 1 });
ContactMailSchema.index({ createdAt: -1 });
