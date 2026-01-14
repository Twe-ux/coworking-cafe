import { Model, model, models } from 'mongoose';
import { ShiftDocument, ShiftSchema } from './document';
import { ShiftMethods, getDurationHours, hasConflictWith } from './methods';

// Attacher les méthodes au schema
ShiftSchema.methods.getDurationHours = getDurationHours;
ShiftSchema.methods.hasConflictWith = hasConflictWith;

export type Shift = ShiftMethods;

let ShiftModel: Model<ShiftDocument>;

// Force model recreation to clear cache
if (models.Shift) {
  delete models.Shift;
}

ShiftModel = model<ShiftDocument>('Shift', ShiftSchema);

if (!ShiftModel) {
  throw new Error('Shift model not initialized');
}

export { ShiftModel as Shift };
export type { ShiftDocument };
