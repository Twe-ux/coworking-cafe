import { IAbsence, AbsenceSchema } from './document';

/**
 * Pre-save hook to calculate totalHours and paidHours
 */
AbsenceSchema.pre('save', function (this: IAbsence, next) {
  // Calculate total hours from affected shifts
  this.totalHours = this.calculateTotalHours();

  // Calculate paid hours (only for paid_leave when approved)
  if (this.type === 'paid_leave' && this.status === 'approved') {
    this.paidHours = this.totalHours;
  } else {
    this.paidHours = 0;
  }

  next();
});

/**
 * Pre-update hook to recalculate hours if status or type changes
 */
AbsenceSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<IAbsence>;

  // If status is being updated to 'approved' and type is 'paid_leave'
  if (update.status === 'approved' && update.type === 'paid_leave') {
    // Calculate total hours and set paid hours
    if (update.affectedShifts) {
      const totalHours = update.affectedShifts.reduce(
        (sum, shift) => sum + shift.scheduledHours,
        0
      );
      this.set({ paidHours: Math.round(totalHours * 100) / 100 });
    }
  }

  // If status is not approved or type is not paid_leave, reset paid hours
  if (update.status !== 'approved' || update.type !== 'paid_leave') {
    this.set({ paidHours: 0 });
  }

  next();
});
