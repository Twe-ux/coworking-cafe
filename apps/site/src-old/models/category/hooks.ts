import { CategorySchema, CategoryDocument } from "./document";
import slugify from "slugify";
import mongoose, { Query, HydratedDocument } from "mongoose";

export function attachHooks() {
  // Auto-generate slug from name if not provided
  CategorySchema.pre("save", async function (this: CategoryDocument, next) {
    if (this.isModified("name") && !this.slug) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
    next();
  });

  // Validate that parent is not self
  CategorySchema.pre("save", async function (this: HydratedDocument<CategoryDocument>, next) {
    if (this.parent && this._id && this.parent.toString() === this._id.toString()) {
      throw new Error("Category cannot be its own parent");
    }
    next();
  });

  // Prevent deletion if category has articles
  CategorySchema.pre("deleteOne", async function (this: Query<any, CategoryDocument>, next) {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      if (doc.articleCount > 0) {
        throw new Error(
          "Cannot delete category with articles. Move or delete articles first."
        );
      }

      // Check if category has children
      const childrenCount = await mongoose.models.Category.countDocuments({
        parent: doc._id,
      });

      if (childrenCount > 0) {
        throw new Error(
          "Cannot delete category with subcategories. Delete subcategories first."
        );
      }
    }

    next();
  });
}
