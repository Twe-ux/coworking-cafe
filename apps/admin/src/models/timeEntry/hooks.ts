import { TimeEntrySchema } from './document'

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

    next()
  })

  // Pre-update: Calculate totalHours if clockOut is updated
  TimeEntrySchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate() as any

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
      } else {
        // If clockOut is null, remove totalHours and set status to active
        update.totalHours = undefined
        update.status = 'active'
      }
    }

    next()
  })
}
