import { MediaDocument, MediaSchema } from "./document";

export interface MediaMethods extends MediaDocument {
  isImage(): boolean;
  isVideo(): boolean;
  getFileExtension(): string;
  getFormattedSize(): string;
}

/** Check if media is an image */
MediaSchema.methods.isImage = function (this: MediaDocument): boolean {
  return this.mimeType.startsWith("image/");
};

/** Check if media is a video */
MediaSchema.methods.isVideo = function (this: MediaDocument): boolean {
  return this.mimeType.startsWith("video/");
};

/** Get file extension from filename */
MediaSchema.methods.getFileExtension = function (this: MediaDocument): string {
  const parts = this.filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/** Get formatted file size (e.g., "1.5 MB") */
MediaSchema.methods.getFormattedSize = function (this: MediaDocument): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = this.size;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};
