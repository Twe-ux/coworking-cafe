import mongoose from 'mongoose';
import { CashRegisterSchema } from './document';

export const CashRegister =
  mongoose.models.CashRegister || mongoose.model('CashRegister', CashRegisterSchema);

export type { CashRegisterDocument, CashCountDetails, CountedBy } from './document';
