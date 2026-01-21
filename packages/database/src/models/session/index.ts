import mongoose from 'mongoose';
import { SessionSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Session =
  mongoose.models.Session || mongoose.model('Session', SessionSchema);

export type { SessionDocument } from './document';
