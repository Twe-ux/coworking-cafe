import mongoose from 'mongoose';
import { AvailabilitySchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Availability =
  mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);

export type { AvailabilityDocument } from './document';
