import { MediaDocument, MediaSchema } from "./document";

/** Virtual object derived from the {@link MediaSchema} for image media. */
export interface VirtualImageMedia extends MediaDocument {
  readonly mimeType: `image/${string}`;
  readonly isImage: true;
  width: number;
  height: number;
}

/** Virtual object derived from the {@link MediaSchema} for video media. */
export interface VirtualVideoMedia extends MediaDocument {
  readonly mimeType: `video/${string}`;
  readonly isVideo: true;
}

/** Virtual object derived from the {@link MediaSchema} for other media types. */
export interface VirtualOtherMedia extends MediaDocument {
  readonly isImage: false;
  readonly isVideo: false;
}

export type VirtualMedia =
  | VirtualImageMedia
  | VirtualVideoMedia
  | VirtualOtherMedia;

// Virtual for file type category
MediaSchema.virtual("fileType").get(function (this: MediaDocument) {
  if (this.mimeType.startsWith("image/")) return "image";
  if (this.mimeType.startsWith("video/")) return "video";
  if (this.mimeType.startsWith("audio/")) return "audio";
  if (
    this.mimeType.includes("pdf") ||
    this.mimeType.includes("document") ||
    this.mimeType.includes("word")
  ) {
    return "document";
  }
  return "other";
});

// Virtual for aspect ratio (for images/videos)
MediaSchema.virtual("aspectRatio").get(function (this: MediaDocument) {
  if (this.width && this.height && this.height > 0) {
    return (this.width / this.height).toFixed(2);
  }
  return null;
});

// Virtual to check if media has dimensions
MediaSchema.virtual("hasDimensions").get(function (this: MediaDocument) {
  return !!(this.width && this.height);
});
