import { TagDocument, TagSchema } from "./document";

/** Virtual object derived from the {@link TagSchema}. */
export interface VirtualTag extends TagDocument {
  readonly hasArticles: boolean;
}

// Insert the virtuals into the TagSchema
TagSchema.virtual("hasArticles").get(function (this: TagDocument) {
  return this.articleCount > 0;
});
