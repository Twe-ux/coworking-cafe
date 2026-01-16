import { AvailabilityDocument, AvailabilitySchema } from './document'

export function attachHooks() {
  // Validation: endTime doit être après startTime
  AvailabilitySchema.pre('save', function (next) {
    const availability = this as AvailabilityDocument

    const startMinutes =
      parseInt(availability.startTime.split(':')[0]) * 60 +
      parseInt(availability.startTime.split(':')[1])
    const endMinutes =
      parseInt(availability.endTime.split(':')[0]) * 60 +
      parseInt(availability.endTime.split(':')[1])

    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'))
    }

    next()
  })
}
