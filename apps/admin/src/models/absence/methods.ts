import { IAbsence, AbsenceSchema } from './document';

/**
 * Calculate total hours of absence based on affected shifts
 * @returns Total hours
 */
AbsenceSchema.methods.calculateTotalHours = function (this: IAbsence): number {
  if (!this.affectedShifts || this.affectedShifts.length === 0) {
    return 0;
  }

  const total = this.affectedShifts.reduce(
    (sum, shift) => sum + shift.scheduledHours,
    0
  );

  return Math.round(total * 100) / 100;
};
