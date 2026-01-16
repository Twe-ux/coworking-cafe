import { Model, model, models } from "mongoose";
import { CashEntryDocument, CashEntrySchema } from "./document";
import { attachHooks } from "./hooks";
import { CashEntryMethods } from "./methods";
import { VirtualCashEntry } from "./virtuals";

export type CashEntry = VirtualCashEntry & CashEntryMethods;

let CashEntryModel: Model<CashEntryDocument>;

if (models.CashEntry) {
  CashEntryModel = models.CashEntry as Model<CashEntryDocument>;
} else {
  attachHooks();
  CashEntryModel = model<CashEntryDocument>("CashEntry", CashEntrySchema);
}

if (!CashEntryModel) {
  throw new Error("CashEntry model not initialized");
}

export { CashEntryModel as CashEntry };
export type { CashEntryDocument } from "./document";

// Default export for backward compatibility
export default CashEntryModel;
