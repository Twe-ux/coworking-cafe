/** Methods available on Booking documents. */
export interface BookingMethods {
  /**
   * Calculate the duration of the booking in minutes
   */
  calculateDuration(): number;

  /**
   * Check if the booking can be cancelled (not in the past, not already cancelled)
   */
  canCancel(): boolean;

  /**
   * Cancel the booking
   */
  cancel(): Promise<void>;
}
