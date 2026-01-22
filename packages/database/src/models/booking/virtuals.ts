import type { BookingDocument } from "./document";

/** Booking object populated with virtual properties. */
export type VirtualBooking = BookingDocument & {
  id: string;
  duration: number; // Duration in minutes
  isUpcoming: boolean;
  isPast: boolean;
  canBeCancelled: boolean;
};
