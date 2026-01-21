import { ArticleDocument, ArticleSchema } from "./document";

/** Virtual object derived from the {@link ArticleSchema}. */
export interface VirtualArticle extends ArticleDocument {
  readonly readingTime: number;
  readonly isPublished: boolean;
}

// Insert the virtuals into the ArticleSchema
ArticleSchema.virtual("readingTime").get(function (this: ArticleDocument) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

ArticleSchema.virtual("isPublished").get(function (this: ArticleDocument) {
  return this.status === "published";
});
