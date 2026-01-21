import { ArticleDocument, ArticleSchema } from "./document";

export interface ArticleMethods extends ArticleDocument {
  publish(): void;
  incrementViewCount(): Promise<ArticleDocument>;
}

ArticleSchema.methods.publish = function (this: ArticleDocument): void {
  this.status = "published";
  this.publishedAt = new Date();
};

ArticleSchema.methods.incrementViewCount = async function (
  this: ArticleDocument
): Promise<ArticleDocument> {
  this.viewCount += 1;
  return this.save();
};
