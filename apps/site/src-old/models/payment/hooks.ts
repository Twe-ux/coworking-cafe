import { PaymentSchema, PaymentDocument } from "./document";

export function attachHooks() {
  // Set completedAt when payment succeeds
  PaymentSchema.pre("save", function (this: PaymentDocument, next) {
    if (this.isModified("status")) {
      if (this.status === "succeeded" && !this.completedAt) {
        this.completedAt = new Date();
      }

      if (this.status === "failed" && !this.failedAt) {
        this.failedAt = new Date();
      }

      if (this.status === "refunded" && this.metadata) {
        if (!this.metadata.refundedAt) {
          this.metadata.refundedAt = new Date();
        }
        if (!this.metadata.refundedAmount) {
          this.metadata.refundedAmount = this.amount;
        }
      }
    }

    next();
  });

  // Update booking payment status when payment status changes
  PaymentSchema.post("save", async function (doc) {
    const mongoose = await import("mongoose");

    if (doc.status === "succeeded") {
      await mongoose.default.models.Reservation?.findByIdAndUpdate(doc.booking, {
        paymentStatus: "paid",
        status: "confirmed",
      });
    } else if (doc.status === "failed") {
      await mongoose.default.models.Reservation?.findByIdAndUpdate(doc.booking, {
        paymentStatus: "failed",
      });
    } else if (doc.status === "refunded") {
      await mongoose.default.models.Reservation?.findByIdAndUpdate(doc.booking, {
        paymentStatus: "refunded",
      });
    }
  });
}
