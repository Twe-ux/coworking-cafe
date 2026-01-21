import mongoose from 'mongoose';
import { ShiftSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Shift =
  mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);

export type { ShiftDocument } from './document';
