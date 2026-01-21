import { ShiftSchema } from './document';

/**
 * Virtual: formattedDate
 * Returns date in readable format
 */
ShiftSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('fr-FR');
});

/**
 * Virtual: timeRange
 * Returns formatted time range
 */
ShiftSchema.virtual('timeRange').get(function () {
  return `${this.startTime} - ${this.endTime}`;
});
