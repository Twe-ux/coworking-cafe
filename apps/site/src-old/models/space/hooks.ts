import { SpaceSchema, SpaceDocument } from "./document";
import slugify from "slugify";
import mongoose from "mongoose";

export function attachHooks() {
  // Auto-generate slug from name
  SpaceSchema.pre("save", async function (this: SpaceDocument, next) {
    if (this.isModified("name") && !this.slug) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        trim: true,
      });

      // Ensure slug is unique
      const existingSpace = await mongoose.models.Space?.findOne({
        slug: this.slug,
      });
      if (existingSpace) {
        this.slug = `${this.slug}-${Date.now()}`;
      }
    }

    next();
  });

  // Set deletedAt when soft deleting
  SpaceSchema.pre("save", function (this: SpaceDocument, next) {
    if (this.isModified("isDeleted") && this.isDeleted && !this.deletedAt) {
      this.deletedAt = new Date();
    }

    next();
  });
}
