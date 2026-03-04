import { IAbsence, AbsenceSchema } from './document';

/**
 * Virtual: isPending
 * Returns true if absence is pending approval
 */
AbsenceSchema.virtual('isPending').get(function (this: IAbsence) {
  return this.status === 'pending';
});

/**
 * Virtual: isApproved
 * Returns true if absence is approved
 */
AbsenceSchema.virtual('isApproved').get(function (this: IAbsence) {
  return this.status === 'approved';
});

/**
 * Virtual: isRejected
 * Returns true if absence is rejected
 */
AbsenceSchema.virtual('isRejected').get(function (this: IAbsence) {
  return this.status === 'rejected';
});

/**
 * Virtual: durationInDays
 * Calculate duration in days (inclusive)
 */
AbsenceSchema.virtual('durationInDays').get(function (this: IAbsence) {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 to include both start and end dates
});
