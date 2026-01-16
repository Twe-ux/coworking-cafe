import { Model, model, models, HydratedDocument } from 'mongoose'
import { ITimeEntry, ITimeEntryMethods, TimeEntrySchema } from './document'
import { attachHooks } from './hooks'
import './methods'
import { VirtualTimeEntry } from './virtuals'

export type TimeEntry = VirtualTimeEntry & ITimeEntryMethods

// Type complet avec méthodes
export type TimeEntryWithMethods = HydratedDocument<ITimeEntry> & ITimeEntryMethods

// Type Model avec méthodes
export type TimeEntryModelType = Model<ITimeEntry, {}, ITimeEntryMethods>

let TimeEntryModel: TimeEntryModelType

if (models.TimeEntry) {
  TimeEntryModel = models.TimeEntry as TimeEntryModelType
} else {
  attachHooks()
  TimeEntryModel = model<ITimeEntry, TimeEntryModelType>('TimeEntry', TimeEntrySchema)
}

if (!TimeEntryModel) {
  throw new Error('TimeEntry model not initialized')
}

export default TimeEntryModel
export type { ITimeEntry }
