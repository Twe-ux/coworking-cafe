import { Model, model, models } from "mongoose";
import { PaymentDocument, PaymentSchema } from "./document";
import { attachHooks } from "./hooks";
import { PaymentMethods } from "./methods";
import { VirtualPayment } from "./virtuals";

export type Payment = VirtualPayment & PaymentMethods;

let PaymentModel: Model<PaymentDocument>;

if (models.Payment) {
  PaymentModel = models.Payment as Model<PaymentDocument>;
} else {
  attachHooks();
  PaymentModel = model<PaymentDocument>("Payment", PaymentSchema);
}

if (!PaymentModel) {
  throw new Error("Payment model not initialized");
}

export { PaymentModel as Payment };
export type {
  PaymentDocument,
  PaymentStatus,
  PaymentMethodType,
  CardBrand,
} from "./document";
