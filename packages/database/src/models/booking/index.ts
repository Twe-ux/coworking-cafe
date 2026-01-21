import mongoose from "mongoose";
import { BookingSchema, type BookingDocument } from "./document";
import './methods';
import './hooks';
import './virtuals';

export { BookingDocument };
export type { BookingStatus, ReservationType } from "./document";

export const Booking =
  (mongoose.models.Booking as mongoose.Model<BookingDocument>) ||
  mongoose.model<BookingDocument>("Booking", BookingSchema);
