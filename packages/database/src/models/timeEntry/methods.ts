import { TimeEntrySchema } from './document';

/**
 * Instance Methods for TimeEntry Model
 */

/**
 * Calculate total hours worked (clockOut - clockIn)
 */
TimeEntrySchema.methods.calculateTotalHours = function (): number {
  if (!this.clockOut) return 0;

  const [inHours, inMinutes] = this.clockIn.split(':').map(Number);
  const [outHours, outMinutes] = this.clockOut.split(':').map(Number);

  const clockInTime = inHours * 60 + inMinutes;
  const clockOutTime = outHours * 60 + outMinutes;

  const totalMinutes = clockOutTime - clockInTime;
  const totalHours = totalMinutes / 60;

  return Math.round(totalHours * 100) / 100; // Round to 2 decimals
};

/**
 * Mark as completed and calculate hours
 */
TimeEntrySchema.methods.complete = async function () {
  this.status = 'completed';
  this.totalHours = this.calculateTotalHours();
  return this.save();
};
