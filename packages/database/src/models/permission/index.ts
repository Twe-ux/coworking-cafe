import mongoose from 'mongoose';
import { PermissionSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Permission =
  mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);

export type { PermissionDocument } from './document';
