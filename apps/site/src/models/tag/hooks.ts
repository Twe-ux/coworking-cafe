import { TagSchema, TagDocument } from "./document";
import slugify from "slugify";

export function attachHooks() {
  // Auto-generate slug from name if not provided
  TagSchema.pre("save", async function (this: TagDocument, next) {
    if (this.isModified("name") && !this.slug) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
    next();
  });

  // Validate color format if provided
  TagSchema.pre("save", async function (this: TagDocument, next) {
    if (this.color && !this.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      throw new Error("Invalid color format. Use hex format (e.g., #FF5733)");
    }
    next();
  });
}
