import { IShift, ShiftSchema } from './document'

export interface ShiftMethods extends IShift {
  getDurationHours(): number
  hasConflictWith(otherShift: IShift): boolean
}

/**
 * Calculate shift duration in hours
 * Handles night shifts where endTime < startTime (crosses midnight)
 */
ShiftSchema.methods.getDurationHours = function (this: IShift): number {
  const start = new Date(`2000-01-01 ${this.startTime}`)
  let end = new Date(`2000-01-01 ${this.endTime}`)

  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if this shift has a time conflict with another shift
 * Returns true if shifts overlap for the same employee on the same date
 */
ShiftSchema.methods.hasConflictWith = function (
  this: IShift,
  otherShift: IShift
): boolean {
  if (this.employeeId.toString() !== otherShift.employeeId.toString()) {
    return false
  }

  if (this.date.toDateString() !== otherShift.date.toDateString()) {
    return false
  }

  const thisStart = new Date(`2000-01-01 ${this.startTime}`)
  const thisEnd = new Date(`2000-01-01 ${this.endTime}`)
  const otherStart = new Date(`2000-01-01 ${otherShift.startTime}`)
  const otherEnd = new Date(`2000-01-01 ${otherShift.endTime}`)

  // Gérer les créneaux qui passent minuit
  if (thisEnd <= thisStart) {
    thisEnd.setDate(thisEnd.getDate() + 1)
  }
  if (otherEnd <= otherStart) {
    otherEnd.setDate(otherEnd.getDate() + 1)
  }

  return thisStart < otherEnd && thisEnd > otherStart
}
