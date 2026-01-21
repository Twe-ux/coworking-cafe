import { ArticleDocument, ArticleSchema } from "./document";

export interface ArticleMethods extends ArticleDocument {
  publish(): Promise<void>;
  archive(): Promise<void>;
  incrementView(): Promise<void>;
  incrementLike(): Promise<void>;
  canBeEditedBy(userId: string): boolean;
}

/** Publish the article */
ArticleSchema.methods.publish = async function (
  this: ArticleDocument
): Promise<void> {
  this.status = "published";
  this.publishedAt = new Date();
  await this.save();
};

/** Archive the article */
ArticleSchema.methods.archive = async function (
  this: ArticleDocument
): Promise<void> {
  this.status = "archived";
  await this.save();
};

/** Increment view count */
ArticleSchema.methods.incrementView = async function (
  this: ArticleDocument
): Promise<void> {
  this.viewCount += 1;
  await this.save();
};

/** Increment like count */
ArticleSchema.methods.incrementLike = async function (
  this: ArticleDocument
): Promise<void> {
  this.likeCount += 1;
  await this.save();
};

/** Check if article can be edited by a specific user */
ArticleSchema.methods.canBeEditedBy = function (
  this: ArticleDocument,
  userId: string
): boolean {
  return this.author.toString() === userId;
};
