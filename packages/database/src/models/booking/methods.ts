import { BookingSchema } from './document';

/**
 * Instance Methods for Booking Model
 */

/**
 * Check if booking is confirmed
 */
BookingSchema.methods.isConfirmed = function (): boolean {
  return this.status === 'confirmed';
};

/**
 * Check if booking is pending
 */
BookingSchema.methods.isPending = function (): boolean {
  return this.status === 'pending';
};
