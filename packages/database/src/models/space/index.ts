import { Model, model, models } from "mongoose";
import { SpaceDocument, SpaceSchema } from "./document";
import { attachHooks } from "./hooks";
import { SpaceMethods } from "./methods";
import { VirtualSpace } from "./virtuals";

export type Space = VirtualSpace & SpaceMethods;

let SpaceModel: Model<SpaceDocument>;

if (models.Space) {
  SpaceModel = models.Space as Model<SpaceDocument>;
} else {
  attachHooks();
  SpaceModel = model<SpaceDocument>("Space", SpaceSchema);
}

if (!SpaceModel) {
  throw new Error("Space model not initialized");
}

export { SpaceModel as Space };
export type { SpaceDocument, SpaceAmenity, SpaceType } from "./document";
