import { Model, model, models } from "mongoose";
import { TagDocument, TagSchema } from "./document";
import { attachHooks } from "./hooks";
import { TagMethods } from "./methods";
import { VirtualTag } from "./virtuals";

export type Tag = VirtualTag & TagMethods;

let TagModel: Model<TagDocument>;

if (models.Tag) {
  TagModel = models.Tag as Model<TagDocument>;
} else {
  attachHooks();
  TagModel = model<TagDocument>("Tag", TagSchema);
}

if (!TagModel) {
  throw new Error("Tag model not initialized");
}

export { TagModel as Tag };
export type { TagDocument } from "./document";
