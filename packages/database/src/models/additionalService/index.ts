import { Model, model, models } from "mongoose";
import {
  AdditionalServiceDocument,
  AdditionalServiceSchema,
} from "./document";
import { attachHooks } from "./hooks";
import { AdditionalServiceMethods } from "./methods";
import { VirtualAdditionalService } from "./virtuals";

export type AdditionalService = VirtualAdditionalService &
  AdditionalServiceMethods;

let AdditionalServiceModel: Model<AdditionalServiceDocument>;

if (models.AdditionalService) {
  AdditionalServiceModel =
    models.AdditionalService as Model<AdditionalServiceDocument>;
} else {
  attachHooks();
  AdditionalServiceModel = model<AdditionalServiceDocument>(
    "AdditionalService",
    AdditionalServiceSchema
  );
}

if (!AdditionalServiceModel) {
  throw new Error("AdditionalService model not initialized");
}

export { AdditionalServiceModel as AdditionalService };
export type { AdditionalServiceDocument } from "./document";
