import mongoose from 'mongoose';
import { TimeEntrySchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const TimeEntry =
  mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);

export type { TimeEntryDocument } from './document';
