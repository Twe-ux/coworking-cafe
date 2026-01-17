import { Model, model, models } from "mongoose";
import { MenuCategoryDocument, MenuCategorySchema } from "./document";

let MenuCategoryModel: Model<MenuCategoryDocument>;

if (models.MenuCategory) {
  MenuCategoryModel = models.MenuCategory as Model<MenuCategoryDocument>;
} else {
  MenuCategoryModel = model<MenuCategoryDocument>("MenuCategory", MenuCategorySchema);
}

if (!MenuCategoryModel) {
  throw new Error("MenuCategory model not initialized");
}

export { MenuCategoryModel as MenuCategory };
export type { MenuCategoryDocument };
