import { AvailabilitySchema } from './document';

/**
 * Instance Methods for Availability Model
 */

/**
 * Get day name
 */
AvailabilitySchema.methods.getDayName = function (): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.dayOfWeek];
};

/**
 * Check if availability is currently effective
 */
AvailabilitySchema.methods.isCurrentlyEffective = function (): boolean {
  const now = new Date();

  if (this.effectiveFrom && now < this.effectiveFrom) return false;
  if (this.effectiveUntil && now > this.effectiveUntil) return false;

  return this.isActive;
};
