import { Document, ObjectId, Schema, Types } from "mongoose";
import type { Role } from "./index";

/** Document of a {@link Role}, as stored in the database. */
export interface RoleDocument extends Document {
  name: string;
  slug: "dev" | "admin" | "staff" | "client";
  description?: string;
  level: number;
  permissions: ObjectId[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Role objects for the database. */
export const RoleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Role slug is required"],
      lowercase: true,
      trim: true,
      enum: ["dev", "admin", "staff", "client"],
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      default: 50,
      // dev=100, admin=80, staff=50
    },
    permissions: [
      {
        type: Types.ObjectId,
        ref: "Permission",
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RoleSchema.index({ slug: 1 }, { unique: true });
RoleSchema.index({ level: -1 });
