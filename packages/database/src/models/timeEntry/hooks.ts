import { TimeEntrySchema } from './document';

/**
 * Pre-save Hook
 * Auto-calculate total hours when clockOut is set
 */
TimeEntrySchema.pre('save', function (next) {
  if (this.clockOut && this.status === 'completed') {
    const [inHours, inMinutes] = this.clockIn.split(':').map(Number);
    const [outHours, outMinutes] = this.clockOut.split(':').map(Number);

    const clockInTime = inHours * 60 + inMinutes;
    const clockOutTime = outHours * 60 + outMinutes;

    const totalMinutes = clockOutTime - clockInTime;
    this.totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  }
  next();
});
