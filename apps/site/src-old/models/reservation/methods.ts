/** Methods available on Reservation documents. */
export interface ReservationMethods {
  /**
   * Calculate the duration of the reservation in minutes
   */
  calculateDuration(): number;

  /**
   * Check if the reservation can be cancelled (not in the past, not already cancelled)
   */
  canCancel(): boolean;

  /**
   * Cancel the reservation
   */
  cancel(): Promise<void>;
}
