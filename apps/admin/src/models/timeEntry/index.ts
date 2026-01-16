import { Model, model, models } from 'mongoose'
import { ITimeEntry, TimeEntrySchema } from './document'
import { attachHooks } from './hooks'
import { TimeEntryMethods } from './methods'
import { VirtualTimeEntry } from './virtuals'

export type TimeEntry = VirtualTimeEntry & TimeEntryMethods

let TimeEntryModel: Model<ITimeEntry>

if (models.TimeEntry) {
  TimeEntryModel = models.TimeEntry as Model<ITimeEntry>
} else {
  attachHooks()
  TimeEntryModel = model<ITimeEntry>('TimeEntry', TimeEntrySchema)
}

if (!TimeEntryModel) {
  throw new Error('TimeEntry model not initialized')
}

export default TimeEntryModel
export { ITimeEntry }
