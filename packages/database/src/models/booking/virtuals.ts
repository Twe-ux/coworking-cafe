import { BookingSchema } from './document';

/**
 * Virtual: formattedStartDate
 * Returns formatted start date
 */
BookingSchema.virtual('formattedStartDate').get(function () {
  if (!this.startDate) return '';
  return this.startDate.toLocaleDateString('fr-FR');
});

/**
 * Virtual: formattedEndDate
 * Returns formatted end date
 */
BookingSchema.virtual('formattedEndDate').get(function () {
  if (!this.endDate) return '';
  return this.endDate.toLocaleDateString('fr-FR');
});
