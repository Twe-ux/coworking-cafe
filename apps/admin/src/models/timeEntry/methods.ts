import { ITimeEntry, TimeEntrySchema } from './document'

/**
 * Calculate total hours between clockIn and clockOut
 * Handles night shifts where clockOut < clockIn (crosses midnight)
 * Times are in "HH:mm" format
 */
TimeEntrySchema.methods.calculateTotalHours = function (
  this: ITimeEntry
): number {
  if (!this.clockOut || !this.clockIn) {
    return 0
  }

  // Parse time strings "HH:mm"
  const [inH, inM] = this.clockIn.split(':').map(Number)
  const [outH, outM] = this.clockOut.split(':').map(Number)

  // Convert to minutes since midnight
  const clockInMinutes = inH * 60 + inM
  const clockOutMinutes = outH * 60 + outM

  let totalMinutes: number

  if (clockOutMinutes >= clockInMinutes) {
    // Same day shift
    totalMinutes = clockOutMinutes - clockInMinutes
  } else {
    // Night shift (crosses midnight)
    totalMinutes = 24 * 60 - clockInMinutes + clockOutMinutes
  }

  // Convert to hours with 2 decimal precision
  const hours = totalMinutes / 60
  return Math.round(hours * 100) / 100
}
