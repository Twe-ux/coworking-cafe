import { UpdateQuery } from 'mongoose'
import { TimeEntrySchema, ITimeEntry } from './document'

export function attachHooks() {
  // Pre-save: Calculate totalHours if clockOut exists
  TimeEntrySchema.pre('save', function (next) {
    if (this.clockOut && (!this.totalHours || this.isModified('clockOut'))) {
      this.totalHours = this.calculateTotalHours()
    }

    // Update status based on clockOut
    if (this.clockOut && this.status === 'active') {
      this.status = 'completed'
    } else if (!this.clockOut && this.status === 'completed') {
      this.status = 'active'
    }

    // Detect error: missing clockOut for past dates
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const entryDate = this.date

    if (!this.clockOut && entryDate < today) {
      // Entry is from the past and has no clockOut → error
      this.hasError = true
      this.errorType = 'MISSING_CLOCK_OUT'
      this.errorMessage = 'Pointage de sortie manquant pour une journée passée'
    } else if (this.clockOut || entryDate >= today) {
      // Entry has clockOut OR is today/future → no error
      this.hasError = false
      this.errorType = undefined
      this.errorMessage = undefined
    }

    next()
  })

  // Pre-update: Calculate totalHours if clockOut is updated
  TimeEntrySchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate() as UpdateQuery<ITimeEntry>

    if (update.clockOut !== undefined) {
      // If clockOut is set, calculate totalHours
      if (update.clockOut) {
        const clockIn = update.clockIn || this.getQuery().clockIn
        if (clockIn) {
          // Parse time strings "HH:mm"
          const [inH, inM] = clockIn.split(':').map(Number)
          const [outH, outM] = update.clockOut.split(':').map(Number)

          const clockInMinutes = inH * 60 + inM
          const clockOutMinutes = outH * 60 + outM

          let totalMinutes: number
          if (clockOutMinutes >= clockInMinutes) {
            totalMinutes = clockOutMinutes - clockInMinutes
          } else {
            totalMinutes = 24 * 60 - clockInMinutes + clockOutMinutes
          }

          const hours = Math.round((totalMinutes / 60) * 100) / 100
          update.totalHours = hours
        }

        // Set status to completed
        update.status = 'completed'

        // Clear error if clockOut is set
        update.hasError = false
        update.errorType = undefined
        update.errorMessage = undefined
      } else {
        // If clockOut is null, remove totalHours and set status to active
        update.totalHours = undefined
        update.status = 'active'

        // Check if this creates an error (past date without clockOut)
        const doc = await this.model.findOne(this.getQuery())
        if (doc) {
          const today = new Date().toISOString().split('T')[0]
          const entryDate = update.date || doc.date

          if (entryDate < today) {
            update.hasError = true
            update.errorType = 'MISSING_CLOCK_OUT'
            update.errorMessage = 'Pointage de sortie manquant pour une journée passée'
          }
        }
      }
    }

    next()
  })
}
