import { PaymentDocument, PaymentSchema } from "./document";

/** Virtual object derived from the {@link PaymentSchema}. */
export interface VirtualPayment extends PaymentDocument {
  readonly isSuccessful: boolean;
}

// Insert the virtuals into the PaymentSchema
PaymentSchema.virtual("isSuccessful").get(function (this: PaymentDocument) {
  return this.status === "succeeded";
});
