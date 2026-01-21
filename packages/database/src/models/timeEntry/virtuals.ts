import { TimeEntrySchema } from './document';

/**
 * Virtual: formattedDate
 * Returns date in readable format
 */
TimeEntrySchema.virtual('formattedDate').get(function () {
  const [year, month, day] = this.date.split('-');
  return `${day}/${month}/${year}`;
});

/**
 * Virtual: duration
 * Returns duration string
 */
TimeEntrySchema.virtual('duration').get(function () {
  if (!this.totalHours) return 'N/A';
  const hours = Math.floor(this.totalHours);
  const minutes = Math.round((this.totalHours - hours) * 60);
  return `${hours}h ${minutes}min`;
});
