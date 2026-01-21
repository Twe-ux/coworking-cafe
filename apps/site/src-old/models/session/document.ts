import { ObjectId, Schema, Types, Document } from "mongoose";
import type { Session } from "./index";

/** Document of a {@link Session}, as stored in the database. */
export interface SessionDocument extends Document {
  userId: ObjectId;
  token: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  expiresAt: Date;
  refreshExpiresAt: Date;
  isActive: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Session objects for the database. */
export const SessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      select: false,
    },
    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
      unique: true,
      select: false,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    refreshExpiresAt: {
      type: Date,
      required: [true, "Refresh expiration date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivityAt: {
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
// TTL index for automatic cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1, isActive: 1 });
// Note: token and refreshToken already have unique indexes from schema definition
