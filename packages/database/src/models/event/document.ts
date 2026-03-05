import { Schema, Types, Document } from "mongoose";

export type EventStatus = "draft" | "published" | "archived" | "cancelled";
export type RegistrationType = "internal" | "external";

/** Document of an {@link Event}, as stored in the database. */
export interface EventDocument extends Document {
  // Basic information
  title: string;
  slug: string;
  description: string;
  shortDescription?: string; // For event cards

  // Date & time
  date: string; // YYYY-MM-DD format
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format

  // Category & image
  category: string[]; // e.g., ["Atelier", "Formation"]
  imgSrc: string; // Cloudinary URL
  imgAlt: string; // Alt text for SEO

  // Location
  location?: string; // "Salle Verrière", "Open Space", etc.

  // Registration
  registrationType: RegistrationType;
  externalLink?: string; // URL if external registration
  maxParticipants?: number; // Max participants if internal registration
  currentParticipants?: number; // Current count if internal registration

  // Optional information
  priceType?: "free" | "organizer" | "fixed"; // Type of pricing
  price?: number; // Price if paid event (display only, no payment system)
  organizer?: string; // Organizer name
  contactEmail?: string; // Contact email for the event

  // Status & metadata
  status: EventStatus;
  createdBy: Types.ObjectId; // Reference to User (admin)
  relatedBooking?: Types.ObjectId; // Reference to Booking (auto-created to block calendar)
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Event objects for the database. */
export const EventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      // unique index defined explicitly below
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"],
      index: true,
    },
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    category: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: "At least one category is required",
      },
      index: true,
    },
    imgSrc: {
      type: String,
      required: [true, "Image is required"],
    },
    imgAlt: {
      type: String,
      required: [true, "Image alt text is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    registrationType: {
      type: String,
      required: [true, "Registration type is required"],
      enum: {
        values: ["internal", "external"],
        message: "{VALUE} is not a valid registration type",
      },
      default: "external",
    },
    externalLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(this: EventDocument, v: string | undefined) {
          // External link required if registration type is external
          if (this.registrationType === "external" && !v) {
            return false;
          }
          return true;
        },
        message: "External link is required when registration type is external",
      },
    },
    maxParticipants: {
      type: Number,
      min: [1, "Maximum participants must be at least 1"],
      validate: {
        validator: function(this: EventDocument, v: number | undefined) {
          // Max participants required if registration type is internal
          if (this.registrationType === "internal" && !v) {
            return false;
          }
          return true;
        },
        message: "Maximum participants is required when registration type is internal",
      },
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, "Current participants cannot be negative"],
    },
    priceType: {
      type: String,
      enum: {
        values: ["free", "organizer", "fixed"],
        message: "{VALUE} is not a valid price type",
      },
      default: "free",
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    organizer: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["draft", "published", "archived", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "draft",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
      // index defined explicitly below
    },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
EventSchema.index({ date: 1, status: 1 }); // For listing upcoming published events
EventSchema.index({ slug: 1 }, { unique: true }); // Unique slug for SEO
EventSchema.index({ category: 1, status: 1 }); // Filter by category
EventSchema.index({ createdBy: 1 }); // Filter events by creator
EventSchema.index({ status: 1, date: -1 }); // Admin dashboard - filter by status, sort by date
