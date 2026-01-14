import { Model, model, models } from "mongoose";
import { MediaDocument, MediaSchema } from "./document";
import { attachHooks } from "./hooks";
import { MediaMethods } from "./methods";
import { VirtualMedia } from "./virtuals";

export type Media = VirtualMedia & MediaMethods;

let MediaModel: Model<MediaDocument>;

if (models.Media) {
  MediaModel = models.Media as Model<MediaDocument>;
} else {
  attachHooks();
  MediaModel = model<MediaDocument>("Media", MediaSchema);
}

if (!MediaModel) {
  throw new Error("Media model not initialized");
}

export { MediaModel as Media };
