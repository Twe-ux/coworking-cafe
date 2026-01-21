import { AvailabilitySchema } from './document';

/**
 * Virtual: dayNameFr
 * Returns French day name
 */
AvailabilitySchema.virtual('dayNameFr').get(function () {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[this.dayOfWeek];
});

/**
 * Virtual: timeRange
 * Returns formatted time range
 */
AvailabilitySchema.virtual('timeRange').get(function () {
  return `${this.startTime} - ${this.endTime}`;
});
