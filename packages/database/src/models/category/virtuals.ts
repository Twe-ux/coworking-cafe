import { CategoryDocument, CategorySchema } from "./document";

/** Virtual object derived from the {@link CategorySchema}. */
export interface VirtualCategory extends CategoryDocument {
  readonly hasArticles: boolean;
}

// Insert the virtuals into the CategorySchema
CategorySchema.virtual("hasArticles").get(function (this: CategoryDocument) {
  return this.articleCount > 0;
});
