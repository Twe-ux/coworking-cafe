import { Model, model, models } from "mongoose";
import { CategoryDocument, CategorySchema } from "./document";
import { attachHooks } from "./hooks";
import { CategoryMethods } from "./methods";
import { VirtualCategory } from "./virtuals";

export type Category = VirtualCategory & CategoryMethods;

let CategoryModel: Model<CategoryDocument>;

if (models.Category) {
  CategoryModel = models.Category as Model<CategoryDocument>;
} else {
  attachHooks();
  CategoryModel = model<CategoryDocument>("Category", CategorySchema);
}

if (!CategoryModel) {
  throw new Error("Category model not initialized");
}

export { CategoryModel as Category };
