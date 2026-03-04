import mongoose from 'mongoose';
import { IAbsence, AbsenceSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

/**
 * Absence Model
 * Handles employee absences: unavailability, paid leave (CP), sick leave (AM)
 */
const AbsenceModel =
  (mongoose.models.Absence as mongoose.Model<IAbsence>) ||
  mongoose.model<IAbsence>('Absence', AbsenceSchema);

export { AbsenceModel as Absence };
export default AbsenceModel;
export type { IAbsence, IAffectedShift } from './document';
