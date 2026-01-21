import mongoose from "mongoose";
import { SpaceConfigurationDocument } from "./document";
import spaceConfigurationSchema from "./schema";

export * from "./document";

const SpaceConfiguration =
  (mongoose.models
    .SpaceConfiguration as mongoose.Model<SpaceConfigurationDocument>) ||
  mongoose.model<SpaceConfigurationDocument>(
    "SpaceConfiguration",
    spaceConfigurationSchema
  );

export default SpaceConfiguration;
