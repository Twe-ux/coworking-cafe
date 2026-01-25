import mongoose from 'mongoose';
import unavailabilitySchema from './document';
import type { IUnavailabilityDocument } from '@/types/unavailability';

const Unavailability =
  (mongoose.models.Unavailability as mongoose.Model<IUnavailabilityDocument>) ||
  mongoose.model<IUnavailabilityDocument>('Unavailability', unavailabilitySchema);

export default Unavailability;
