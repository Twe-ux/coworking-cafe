import { TagDocument, TagSchema } from "./document";

export interface TagMethods extends TagDocument {
  incrementArticleCount(): Promise<void>;
  decrementArticleCount(): Promise<void>;
}

/** Increment article count */
TagSchema.methods.incrementArticleCount = async function (
  this: TagDocument
): Promise<void> {
  this.articleCount += 1;
  await this.save();
};

/** Decrement article count */
TagSchema.methods.decrementArticleCount = async function (
  this: TagDocument
): Promise<void> {
  if (this.articleCount > 0) {
    this.articleCount -= 1;
    await this.save();
  }
};
