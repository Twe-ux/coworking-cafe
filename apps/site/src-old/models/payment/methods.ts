import { PaymentDocument, PaymentSchema } from "./document";

export interface PaymentMethods extends PaymentDocument {
  markAsSucceeded(): Promise<void>;
  markAsFailed(reason: string): Promise<void>;
  markAsRefunded(refundId: string, reason?: string, amount?: number): Promise<void>;
  canBeRefunded(): boolean;
  isSuccessful(): boolean;
}

/** Mark payment as succeeded */
PaymentSchema.methods.markAsSucceeded = async function (
  this: PaymentDocument
): Promise<void> {
  this.status = "succeeded";
  this.completedAt = new Date();
  await this.save();
};

/** Mark payment as failed */
PaymentSchema.methods.markAsFailed = async function (
  this: PaymentDocument,
  reason: string
): Promise<void> {
  this.status = "failed";
  this.failureReason = reason;
  this.failedAt = new Date();
  await this.save();
};

/** Mark payment as refunded */
PaymentSchema.methods.markAsRefunded = async function (
  this: PaymentDocument,
  refundId: string,
  reason?: string,
  amount?: number
): Promise<void> {
  this.status = "refunded";
  this.stripeRefundId = refundId;

  if (!this.metadata) {
    this.metadata = {};
  }

  this.metadata.refundReason = reason;
  this.metadata.refundedAmount = amount || this.amount;
  this.metadata.refundedAt = new Date();

  await this.save();
};

/** Check if payment can be refunded */
PaymentSchema.methods.canBeRefunded = function (
  this: PaymentDocument
): boolean {
  return this.status === "succeeded" && !this.stripeRefundId;
};

/** Check if payment is successful */
PaymentSchema.methods.isSuccessful = function (
  this: PaymentDocument
): boolean {
  return this.status === "succeeded";
};
