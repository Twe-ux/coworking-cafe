import { CategoryDocument, CategorySchema } from "./document";

/** Virtual object derived from the {@link CategorySchema}. */
export interface VirtualCategory extends CategoryDocument {
  readonly hasArticles: boolean;
  readonly displayColor: string;
}

// Virtual for children (subcategories)
CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for articles
CategorySchema.virtual("articles", {
  ref: "Article",
  localField: "_id",
  foreignField: "category",
});

// Virtual to check if category has articles
CategorySchema.virtual("hasArticles").get(function (this: CategoryDocument) {
  return this.articleCount > 0;
});

// Virtual for display color (return color or default)
CategorySchema.virtual("displayColor").get(function (this: CategoryDocument) {
  return this.color || "#6B7280"; // Default gray color
});
