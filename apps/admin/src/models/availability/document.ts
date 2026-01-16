import mongoose, { Schema, Document } from 'mongoose'

/** Document of an {@link Availability}, as stored in the database. */
export interface AvailabilityDocument extends Document {
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

/** Schema used to validate Availability objects for the database. */
export const AvailabilitySchema = new Schema<AvailabilityDocument>(
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

// Indexes
AvailabilitySchema.index({ employeeId: 1, dayOfWeek: 1, startTime: 1, isActive: 1 })
