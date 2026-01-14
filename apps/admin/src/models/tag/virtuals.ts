import { TagDocument, TagSchema } from "./document";

/** Virtual object derived from the {@link TagSchema}. */
export interface VirtualTag extends TagDocument {
  readonly hasArticles: boolean;
  readonly displayColor: string;
}

// Virtual to check if tag has articles
TagSchema.virtual("hasArticles").get(function (this: TagDocument) {
  return this.articleCount > 0;
});

// Virtual for display color (return color or default)
TagSchema.virtual("displayColor").get(function (this: TagDocument) {
  return this.color || "#6B7280"; // Default gray color
});
