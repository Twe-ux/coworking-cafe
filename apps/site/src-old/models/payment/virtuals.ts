import { PaymentDocument, PaymentSchema } from "./document";

/** Virtual object derived from the {@link PaymentSchema} */
export type VirtualPayment = PaymentDocument;

// Virtual to check if payment is pending
PaymentSchema.virtual("isPending").get(function (this: PaymentDocument) {
  return this.status === "pending" || this.status === "processing";
});

// Virtual to check if payment is completed
PaymentSchema.virtual("isCompleted").get(function (this: PaymentDocument) {
  return this.status === "succeeded" || this.status === "refunded";
});

// Virtual to check if payment is refunded
PaymentSchema.virtual("isRefunded").get(function (this: PaymentDocument) {
  return this.status === "refunded";
});

// Virtual to get formatted amount
PaymentSchema.virtual("formattedAmount").get(function (this: PaymentDocument) {
  return `${(this.amount / 100).toFixed(2)} ${this.currency}`;
});

// Virtual to get processing time (time between creation and completion)
PaymentSchema.virtual("processingTime").get(function (this: PaymentDocument) {
  if (!this.completedAt) return null;
  return this.completedAt.getTime() - this.createdAt.getTime();
});

// Virtual to get masked card number
PaymentSchema.virtual("maskedCardNumber").get(function (this: PaymentDocument) {
  if (!this.metadata?.cardLast4) return null;
  return `**** **** **** ${this.metadata.cardLast4}`;
});
