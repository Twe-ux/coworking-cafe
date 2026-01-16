import { IShift, ShiftSchema } from './document'

/** Virtual properties for Shift */
export interface VirtualShift extends IShift {
  readonly formattedDate: string
  readonly timeRange: string
}

// Virtuel pour formater la date
ShiftSchema.virtual('formattedDate').get(function (this: IShift) {
  return this.date.toLocaleDateString('fr-FR')
})

// Virtuel pour formater la période
ShiftSchema.virtual('timeRange').get(function (this: IShift) {
  return `${this.startTime} - ${this.endTime}`
})
