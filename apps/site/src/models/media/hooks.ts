import { MediaSchema } from "./document";

export function attachHooks() {
  // Validate file size (max 10MB by default)
  MediaSchema.pre("save", async function (next) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (this.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }
    next();
  });

  // Validate image dimensions if provided
  MediaSchema.pre("save", async function (next) {
    if (this.mimeType.startsWith("image/")) {
      if ((this.width && !this.height) || (!this.width && this.height)) {
        throw new Error("Both width and height must be provided for images");
      }
    }
    next();
  });

  // Set default alt text if not provided for images
  MediaSchema.pre("save", async function (next) {
    if (this.mimeType.startsWith("image/") && !this.alt) {
      this.alt = this.originalName.replace(/\.[^/.]+$/, ""); // Remove extension
    }
    next();
  });
}
