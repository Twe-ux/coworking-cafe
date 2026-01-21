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

// Export as both named and default to support both import styles:
// - import Payment from '@/models/payment' (default)
// - import { Payment } from '@/models/payment' (named)
export { PaymentModel as Payment };
export default PaymentModel;
