import { Model, model, models } from "mongoose";
import { B2BRevenueDocument, B2BRevenueSchema } from "./document";
import { attachHooks } from "./hooks";
import { calculateTVA, getFormattedDate, type B2BRevenueMethods } from "./methods";
import { getTvaRate, type VirtualB2BRevenue } from "./virtuals";

// Attach methods
B2BRevenueSchema.methods.calculateTVA = calculateTVA;
B2BRevenueSchema.methods.getFormattedDate = getFormattedDate;

// Attach virtuals
B2BRevenueSchema.virtual("tvaRate").get(getTvaRate);

// Export combined type
export type B2BRevenue = VirtualB2BRevenue & B2BRevenueMethods;

let B2BRevenueModel: Model<B2BRevenueDocument>;

if (models.B2BRevenue) {
  B2BRevenueModel = models.B2BRevenue as Model<B2BRevenueDocument>;
} else {
  attachHooks();
  B2BRevenueModel = model<B2BRevenueDocument>("B2BRevenue", B2BRevenueSchema);
}

if (!B2BRevenueModel) {
  throw new Error("B2BRevenue model not initialized");
}

export { B2BRevenueModel as B2BRevenue };
export type { B2BRevenueDocument } from "./document";

// Default export for backward compatibility
export default B2BRevenueModel;
