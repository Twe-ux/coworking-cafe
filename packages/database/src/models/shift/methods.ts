import { ShiftSchema } from './document';

/**
 * Instance Methods for Shift Model
 */

/**
 * Calculate shift duration in hours
 */
ShiftSchema.methods.getDuration = function (): number {
  const [startHours, startMinutes] = this.startTime.split(':').map(Number);
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const durationMinutes = endTotalMinutes - startTotalMinutes;
  return Math.round((durationMinutes / 60) * 100) / 100;
};

/**
 * Check if shift is today
 */
ShiftSchema.methods.isToday = function (): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shiftDate = new Date(this.date);
  shiftDate.setHours(0, 0, 0, 0);
  return today.getTime() === shiftDate.getTime();
};
