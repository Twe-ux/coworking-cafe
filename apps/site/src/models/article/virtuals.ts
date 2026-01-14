import { ArticleDocument, ArticleSchema } from "./document";

/** Virtual object derived from the {@link ArticleSchema} for published articles. */
export interface VirtualPublishedArticle extends ArticleDocument {
  readonly status: "published";
  readonly isPublished: true;
  publishedAt: Date;
}

/** Virtual object derived from the {@link ArticleSchema} for draft articles. */
export interface VirtualDraftArticle extends ArticleDocument {
  readonly status: "draft";
  readonly isPublished: false;
  publishedAt?: undefined;
}

/** Virtual object derived from the {@link ArticleSchema} for archived articles. */
export interface VirtualArchivedArticle extends ArticleDocument {
  readonly status: "archived";
  readonly isPublished: false;
}

/** Virtual object derived from the {@link ArticleSchema} for scheduled articles. */
export interface VirtualScheduledArticle extends ArticleDocument {
  readonly status: "scheduled";
  readonly isPublished: false;
  scheduledFor: Date;
}

export type VirtualArticle =
  | VirtualPublishedArticle
  | VirtualDraftArticle
  | VirtualArchivedArticle
  | VirtualScheduledArticle;

// Virtual to check if published
ArticleSchema.virtual("isPublished").get(function (this: ArticleDocument) {
  return this.status === "published";
});

// Virtual to check if active (not deleted)
ArticleSchema.virtual("isActive").get(function (this: ArticleDocument) {
  return !this.deletedAt;
});

// Virtual for reading time (assuming 200 words per minute)
ArticleSchema.virtual("readingTime").get(function (this: ArticleDocument) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for engagement rate
ArticleSchema.virtual("engagementRate").get(function (this: ArticleDocument) {
  if (this.viewCount === 0) return 0;
  return (this.likeCount / this.viewCount) * 100;
});
