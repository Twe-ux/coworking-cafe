import mongoose from "mongoose";
import { GlobalHoursConfigurationDocument } from "./document";
import globalHoursConfigurationSchema from "./schema";

export * from "./document";

const GlobalHoursConfiguration =
  (mongoose.models
    .GlobalHoursConfiguration as mongoose.Model<GlobalHoursConfigurationDocument>) ||
  mongoose.model<GlobalHoursConfigurationDocument>(
    "GlobalHoursConfiguration",
    globalHoursConfigurationSchema
  );

export default GlobalHoursConfiguration;
