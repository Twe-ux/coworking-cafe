import { Model, model, models } from 'mongoose'
import { IShift, ShiftSchema } from './document'
import { attachHooks } from './hooks'
import { ShiftMethods } from './methods'
import { VirtualShift } from './virtuals'

export type Shift = VirtualShift & ShiftMethods

let ShiftModel: Model<IShift>

if (models.Shift) {
  ShiftModel = models.Shift as Model<IShift>
} else {
  attachHooks()
  ShiftModel = model<IShift>('Shift', ShiftSchema)
}

if (!ShiftModel) {
  throw new Error('Shift model not initialized')
}

export default ShiftModel
export type { IShift }
