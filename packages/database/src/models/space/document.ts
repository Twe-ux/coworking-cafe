import { Schema, Document } from "mongoose";

export type SpaceAmenity =
  | "wifi"
  | "projector"
  | "whiteboard"
  | "coffee"
  | "printer"
  | "phone"
  | "tv"
  | "air-conditioning"
  | "natural-light"
  | "standing-desk"
  | "ergonomic-chair"
  | "locker"
  | "kitchen-access"
  | "parking";

export type SpaceType =
  | "desk"
  | "meeting-room"
  | "private-office"
  | "event-space";

export interface AvailabilitySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SpacePricing {
  hourly?: number;
  daily?: number;
  weekly?: number;
  monthly?: number;
}

/** Document of a {@link Space}, as stored in the database. */
export interface SpaceDocument extends Document {
  name: string;
  slug: string;
  description: string;
  type: SpaceType;
  capacity: number;
  floor?: string;
  building?: string;
  pricing: SpacePricing;
  amenities: SpaceAmenity[];
  images: string[];
  featuredImage?: string;
  availability: AvailabilitySchedule[];
  isActive: boolean;
  isDeleted: boolean;
  viewCount: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate Space objects for the database. */
export const SpaceSchema = new Schema<SpaceDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: {
      type: String,
      required: true,
      enum: ["desk", "meeting-room", "private-office", "event-space"],
      index: true,
    },
    capacity: { type: Number, required: true, min: 1, max: 100 },
    floor: { type: String, trim: true },
    building: { type: String, trim: true },
    pricing: {
      hourly: { type: Number, min: 0 },
      daily: { type: Number, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
    },
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "projector",
          "whiteboard",
          "coffee",
          "printer",
          "phone",
          "tv",
          "air-conditioning",
          "natural-light",
          "standing-desk",
          "ergonomic-chair",
          "locker",
          "kitchen-access",
          "parking",
        ],
      },
    ],
    images: [{ type: String, trim: true }],
    featuredImage: { type: String, trim: true },
    availability: [
      {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:mm)",
          ],
        },
        endTime: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:mm)",
          ],
        },
        isAvailable: { type: Boolean, required: true, default: true },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
    bookingCount: { type: Number, default: 0, min: 0 },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
SpaceSchema.index({ type: 1, isActive: 1 });
SpaceSchema.index({ isActive: 1, isDeleted: 1 });
SpaceSchema.index({ "pricing.hourly": 1 });
SpaceSchema.index({ "pricing.daily": 1 });
SpaceSchema.index({ capacity: 1 });
SpaceSchema.index({ name: "text", description: "text" });
