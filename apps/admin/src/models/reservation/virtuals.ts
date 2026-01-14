import type { ReservationDocument } from "./document";

/** Reservation object populated with virtual properties. */
export type VirtualReservation = ReservationDocument & {
  id: string;
  duration: number; // Duration in minutes
  isUpcoming: boolean;
  isPast: boolean;
  canBeCancelled: boolean;
};
