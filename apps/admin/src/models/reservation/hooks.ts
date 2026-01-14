import { ReservationSchema, ReservationDocument } from "./document";
import type { ReservationMethods } from "./methods";
import { HydratedDocument } from "mongoose";

type HydratedReservation = HydratedDocument<ReservationDocument> & ReservationMethods;

export function attachHooks(): void {
  // Add methods to schema
  ReservationSchema.methods.calculateDuration = function (
    this: HydratedReservation
  ): number {
    // Return 0 if times are not provided (full day reservation)
    if (!this.startTime || !this.endTime) {
      return 0;
    }
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    return endInMinutes - startInMinutes;
  };

  ReservationSchema.methods.canCancel = function (
    this: HydratedReservation
  ): boolean {
    const now = new Date();
    const reservationDate = new Date(this.date);

    // Cannot cancel if already cancelled or completed
    if (this.status === "cancelled" || this.status === "completed") {
      return false;
    }

    // Cannot cancel if reservation date is in the past
    if (reservationDate < now) {
      return false;
    }

    return true;
  };

  ReservationSchema.methods.cancel = async function (
    this: HydratedReservation
  ): Promise<void> {
    if (!this.canCancel()) {
      throw new Error("This reservation cannot be cancelled");
    }

    this.status = "cancelled";
    this.cancelledAt = new Date();
    await this.save();
  };

  // Add virtuals
  ReservationSchema.virtual("duration").get(function (this: HydratedReservation) {
    return this.calculateDuration();
  });

  ReservationSchema.virtual("isUpcoming").get(function (this: HydratedReservation) {
    const now = new Date();
    const reservationDate = new Date(this.date);
    return reservationDate > now && this.status !== "cancelled" && this.status !== "completed";
  });

  ReservationSchema.virtual("isPast").get(function (this: HydratedReservation) {
    const now = new Date();
    const reservationDate = new Date(this.date);
    return reservationDate < now;
  });

  ReservationSchema.virtual("canBeCancelled").get(function (this: HydratedReservation) {
    return this.canCancel();
  });

  // Pre-save hook to validate times and generate confirmation number
  ReservationSchema.pre("save", function (next) {
    // Only validate times if both are provided and not both "00:00" (which indicates full day)
    if (this.startTime && this.endTime && !(this.startTime === "00:00" && this.endTime === "00:00")) {
      const [startHour, startMinute] = this.startTime.split(":").map(Number);
      const [endHour, endMinute] = this.endTime.split(":").map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      if (endInMinutes <= startInMinutes) {
        next(new Error("End time must be after start time"));
        return;
      }
    }

    // Clear times if both are "00:00" (full day reservation)
    if (this.startTime === "00:00" && this.endTime === "00:00") {
      this.startTime = undefined;
      this.endTime = undefined;
    }

    // Generate confirmation number if not exists and status is confirmed
    if (
      !this.confirmationNumber &&
      (this.status === "confirmed" || this.paymentStatus === "paid")
    ) {
      this.confirmationNumber = `BK${Date.now().toString(36).toUpperCase()}${Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase()}`;
    }

    // Set completedAt when status changes to completed
    if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    }

    next();
  });
}
