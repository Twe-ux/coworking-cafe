import { Model, model, models } from 'mongoose';
import { TimeEntryDocument, TimeEntrySchema } from './document';
import {
  TimeEntryMethods,
  calculateTotalHours,
  completeShift,
} from './methods';

// Attacher les méthodes au schema
TimeEntrySchema.methods.calculateTotalHours = calculateTotalHours;
TimeEntrySchema.methods.completeShift = completeShift;

// Type qui combine le document et les méthodes
export type TimeEntryDocumentWithMethods = TimeEntryDocument & TimeEntryMethods;

let TimeEntryModel: Model<TimeEntryDocument, {}, TimeEntryMethods>;

if (models.TimeEntry) {
  TimeEntryModel = models.TimeEntry as any;
} else {
  // @ts-ignore - Mongoose type inference issues with methods
  TimeEntryModel = model('TimeEntry', TimeEntrySchema);
}

if (!TimeEntryModel) {
  throw new Error('TimeEntry model not initialized');
}

export { TimeEntryModel as TimeEntry };
export type { TimeEntryDocument };
export type { ShiftNumber, TimeEntryStatus } from './document';
