import { ObjectId, Schema, Types, Document } from "mongoose";

/** Document of a {@link Media}, as stored in the database. */
export interface MediaDocument extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  uploadedBy: ObjectId;
  folder?: string;
  alt?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate Media objects for the database. */
export const MediaSchema = new Schema<MediaDocument>(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: 0,
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
    },
    path: {
      type: String,
      required: [true, "File path is required"],
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    thumbnailUrl: {
      type: String,
    },
    uploadedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required"],
    },
    folder: {
      type: String,
      default: "uploads",
    },
    alt: {
      type: String,
      trim: true,
    },
    caption: {
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
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ mimeType: 1 });
MediaSchema.index({ folder: 1 });
MediaSchema.index({ createdAt: -1 });
