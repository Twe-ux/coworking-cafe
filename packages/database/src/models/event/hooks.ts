import { EventSchema } from "./document";

let hooksAttached = false;

/**
 * Attach hooks to EventSchema
 * Guards against multiple attachments
 */
export function attachHooks(): void {
  if (hooksAttached) {
    return;
  }

  // Pre-save hook: Generate slug from title if not provided
  EventSchema.pre("save", async function (next) {
    if (this.isNew && !this.slug) {
      // Auto-generate slug from title
      this.slug = this.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
    }

    next();
  });

  hooksAttached = true;
}
