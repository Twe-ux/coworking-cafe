import { Model, model, models } from "mongoose";
import { MenuItemDocument, MenuItemSchema } from "./document";

let MenuItemModel: Model<MenuItemDocument>;

if (models.MenuItem) {
  MenuItemModel = models.MenuItem as Model<MenuItemDocument>;
} else {
  MenuItemModel = model<MenuItemDocument>("MenuItem", MenuItemSchema);
}

if (!MenuItemModel) {
  throw new Error("MenuItem model not initialized");
}

export { MenuItemModel as MenuItem };
export type { MenuItemDocument };
