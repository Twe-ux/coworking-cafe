import { CategoryDocument, CategorySchema } from "./document";

export interface CategoryMethods extends CategoryDocument {
  incrementArticleCount(): Promise<void>;
  decrementArticleCount(): Promise<void>;
  isRootCategory(): boolean;
  hasParent(): boolean;
}

/** Increment article count */
CategorySchema.methods.incrementArticleCount = async function (
  this: CategoryDocument
): Promise<void> {
  this.articleCount += 1;
  await this.save();
};

/** Decrement article count */
CategorySchema.methods.decrementArticleCount = async function (
  this: CategoryDocument
): Promise<void> {
  if (this.articleCount > 0) {
    this.articleCount -= 1;
    await this.save();
  }
};

/** Check if this is a root category (no parent) */
CategorySchema.methods.isRootCategory = function (
  this: CategoryDocument
): boolean {
  return !this.parent;
};

/** Check if category has a parent */
CategorySchema.methods.hasParent = function (this: CategoryDocument): boolean {
  return !!this.parent;
};
