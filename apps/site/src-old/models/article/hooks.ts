import { ArticleSchema, ArticleDocument } from "./document";
import slugify from "slugify";
import mongoose, { Query } from "mongoose";

export function attachHooks() {
  // Track previous status for article count management
  let wasPublished = false;
  let oldCategoryId: any = null;

  // Auto-generate slug from title
  ArticleSchema.pre("save", async function (this: ArticleDocument, next) {
    if (this.isModified("title") && !this.slug) {
      this.slug = slugify(this.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      // Ensure slug is unique
      const existingArticle = await mongoose.models.Article.findOne({
        slug: this.slug,
      });
      if (existingArticle) {
        this.slug = `${this.slug}-${Date.now()}`;
      }
    }

    // Auto-set publishedAt when status becomes published
    if (
      this.isModified("status") &&
      this.status === "published" &&
      !this.publishedAt
    ) {
      this.publishedAt = new Date();
    }

    // Track previous state for post-save hook
    if (!this.isNew) {
      const original = await mongoose.models.Article.findById(this._id);
      if (original) {
        wasPublished = original.status === "published";
        oldCategoryId = original.category;
      }
    }

    next();
  });

  // Update category article count when article is published
  ArticleSchema.post("save", async function (doc) {
    const isNowPublished = doc.status === "published";
    const justPublished = isNowPublished && (!wasPublished || doc.isNew);
    const justUnpublished = !isNowPublished && wasPublished;
    const categoryChanged = doc.category && oldCategoryId && doc.category.toString() !== oldCategoryId.toString();

    // Increment count when article is newly published
    if (justPublished && doc.category) {
      await mongoose.models.Category.findByIdAndUpdate(doc.category, {
        $inc: { articleCount: 1 },
      });
    }

    // Decrement count when article is unpublished
    if (justUnpublished && oldCategoryId) {
      await mongoose.models.Category.findByIdAndUpdate(oldCategoryId, {
        $inc: { articleCount: -1 },
      });
    }

    // Handle category change for published articles
    if (isNowPublished && categoryChanged) {
      // Decrement old category
      await mongoose.models.Category.findByIdAndUpdate(oldCategoryId, {
        $inc: { articleCount: -1 },
      });
      // Increment new category
      await mongoose.models.Category.findByIdAndUpdate(doc.category, {
        $inc: { articleCount: 1 },
      });
    }

    // Reset tracking variables
    wasPublished = false;
    oldCategoryId = null;
  });

  // Update counters when article is deleted
  ArticleSchema.pre("deleteOne", async function (this: Query<any, ArticleDocument>, next) {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      // Decrement articleCount in category
      if (doc.category) {
        await mongoose.models.Category.findByIdAndUpdate(doc.category, {
          $inc: { articleCount: -1 },
        });
      }
    }

    next();
  });
}
