import { ObjectId, Schema, Types, Document } from "mongoose";

/** Amenities available in a space */
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

/** Space type */
export type SpaceType = "desk" | "meeting-room" | "private-office" | "event-space";

/** Availability schedule for a space */
export interface AvailabilitySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  isAvailable: boolean;
}

/** Pricing structure for a space */
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
    name: {
      type: String,
      required: [true, "Space name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Space slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Space description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      required: [true, "Space type is required"],
      enum: {
        values: ["desk", "meeting-room", "private-office", "event-space"],
        message: "{VALUE} is not a valid space type",
      },
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [100, "Capacity cannot exceed 100"],
    },
    floor: {
      type: String,
      trim: true,
    },
    building: {
      type: String,
      trim: true,
    },
    pricing: {
      hourly: {
        type: Number,
        min: [0, "Hourly price cannot be negative"],
      },
      daily: {
        type: Number,
        min: [0, "Daily price cannot be negative"],
      },
      weekly: {
        type: Number,
        min: [0, "Weekly price cannot be negative"],
      },
      monthly: {
        type: Number,
        min: [0, "Monthly price cannot be negative"],
      },
    },
    amenities: [
      {
        type: String,
        enum: {
          values: [
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
          message: "{VALUE} is not a valid amenity",
        },
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    featuredImage: {
      type: String,
      trim: true,
    },
    availability: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
        },
        isAvailable: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
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
SpaceSchema.index({ type: 1, isActive: 1 });
SpaceSchema.index({ isActive: 1, isDeleted: 1 });
SpaceSchema.index({ "pricing.hourly": 1 });
SpaceSchema.index({ "pricing.daily": 1 });
SpaceSchema.index({ capacity: 1 });
SpaceSchema.index({ name: "text", description: "text" }); // Full-text search
