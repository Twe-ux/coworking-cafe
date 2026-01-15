import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAvailability extends Document {
  employeeId: mongoose.Types.ObjectId
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Dimanche, 1 = Lundi, etc.
  startTime: string // Format "HH:mm"
  endTime: string // Format "HH:mm"
  isRecurring: boolean
  effectiveFrom?: Date
  effectiveUntil?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AvailabilitySchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (v: number) => v >= 0 && v <= 6,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
      },
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: 'Start time must be in HH:mm format',
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: 'End time must be in HH:mm format',
      },
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: null,
    },
    effectiveUntil: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index composé pour éviter les doublons
AvailabilitySchema.index({ employeeId: 1, dayOfWeek: 1, startTime: 1, isActive: 1 })

// Validation: endTime doit être après startTime
AvailabilitySchema.pre('save', function (next) {
  const availability = this as IAvailability

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

const Availability: Model<IAvailability> =
  mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema)

export default Availability
