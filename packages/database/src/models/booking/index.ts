import { Model, model, models } from "mongoose";
import { BookingDocument, BookingSchema } from "./document";
import { attachHooks } from "./hooks";
import { BookingMethods } from "./methods";
import { VirtualBooking } from "./virtuals";

export type Booking = VirtualBooking & BookingMethods;

let BookingModel: Model<BookingDocument>;

if (models.Booking) {
  BookingModel = models.Booking as Model<BookingDocument>;
} else {
  attachHooks();
  BookingModel = model<BookingDocument>("Booking", BookingSchema);
}

if (!BookingModel) {
  throw new Error("Booking model not initialized");
}

export { BookingModel as Booking };
export * from "./document";
