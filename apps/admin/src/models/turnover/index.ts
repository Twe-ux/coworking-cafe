import { Model, model, models } from "mongoose";
import { TurnoverDocument, TurnoverSchema } from "./document";
import { attachHooks } from "./hooks";
import { TurnoverMethods } from "./methods";

export type Turnover = TurnoverDocument & TurnoverMethods;

let TurnoverModel: Model<TurnoverDocument>;

if (models.Turnover) {
  TurnoverModel = models.Turnover as Model<TurnoverDocument>;
} else {
  attachHooks();
  TurnoverModel = model<TurnoverDocument>("Turnover", TurnoverSchema);
}

if (!TurnoverModel) {
  throw new Error("Turnover model not initialized");
}

export { TurnoverModel as Turnover };
export type { TurnoverDocument } from "./document";

// Default export for backward compatibility
export default TurnoverModel;
