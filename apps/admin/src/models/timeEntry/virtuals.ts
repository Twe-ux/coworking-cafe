import { ITimeEntry, TimeEntrySchema } from './document'

/** Virtual object for an active time entry */
export interface VirtualActiveTimeEntry extends ITimeEntry {
  readonly isCompleted: false
  clockOut?: null
}

/** Virtual object for a completed time entry */
export interface VirtualCompletedTimeEntry extends ITimeEntry {
  readonly isCompleted: true
  clockOut: string
  totalHours: number
}

export type VirtualTimeEntry =
  | VirtualActiveTimeEntry
  | VirtualCompletedTimeEntry

// Insert the virtuals into the TimeEntrySchema
TimeEntrySchema.virtual('isCompleted').get(function (this: ITimeEntry) {
  return this.status === 'completed' && !!this.clockOut
})
