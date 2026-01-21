import { Model, model, models } from "mongoose";
import { ArticleDocument, ArticleSchema } from "./document";
import { attachHooks } from "./hooks";
import { ArticleMethods } from "./methods";
import { VirtualArticle } from "./virtuals";

export type Article = VirtualArticle & ArticleMethods;

let ArticleModel: Model<ArticleDocument>;

if (models.Article) {
  ArticleModel = models.Article as Model<ArticleDocument>;
} else {
  attachHooks();
  ArticleModel = model<ArticleDocument>("Article", ArticleSchema);
}

if (!ArticleModel) {
  throw new Error("Article model not initialized");
}

export { ArticleModel as Article };
export type { ArticleDocument } from "./document";
