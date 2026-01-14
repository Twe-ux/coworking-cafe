import { Schema, Document } from "mongoose";
import type { Permission } from "./index";

/** Document of a {@link Permission}, as stored in the database. */
export interface PermissionDocument extends Document {
  name: string;
  slug: string;
  resource:
    | "dashboard"
    | "users"
    | "blog"
    | "categories"
    | "tags"
    | "comments"
    | "media"
    | "settings";
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "manage"
    | "view-all"
    | "view-own"
    | "edit-all"
    | "edit-own"
    | "delete-all"
    | "delete-own"
    | "publish"
    | "moderate"
    | "access";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Permission objects for the database. */
export const PermissionSchema = new Schema<PermissionDocument>(
  {
    name: {
      type: String,
      required: [true, "Permission name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Permission slug is required"],
      lowercase: true,
      trim: true,
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
      lowercase: true,
      enum: [
        "dashboard",
        "users",
        "blog",
        "categories",
        "tags",
        "comments",
        "media",
        "settings",
      ],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      lowercase: true,
      enum: [
        "create",
        "read",
        "update",
        "delete",
        "manage",
        "view-all",
        "view-own",
        "edit-all",
        "edit-own",
        "delete-all",
        "delete-own",
        "publish",
        "moderate",
        "access",
      ],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ slug: 1 }, { unique: true });
