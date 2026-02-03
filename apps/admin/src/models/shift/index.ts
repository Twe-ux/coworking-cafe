import { Model, model, models } from 'mongoose'
import { IShift, ShiftSchema } from './document'
import { attachHooks } from './hooks'
import { ShiftMethods } from './methods'
import { VirtualShift } from './virtuals'

export type Shift = VirtualShift & ShiftMethods

let ShiftModel: Model<IShift>

// IMPORTANT: Delete cached model to ensure schema changes are applied
// This is necessary when schema changes (like date: Date → date: String)
if (models.Shift) {
  delete models.Shift
}

attachHooks()
ShiftModel = model<IShift>('Shift', ShiftSchema)

if (!ShiftModel) {
  throw new Error('Shift model not initialized')
}

export default ShiftModel
export type { IShift }
