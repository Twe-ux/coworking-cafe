import { Schema, Types, Document } from 'mongoose'

/**
 * Methods interface for TimeEntry
 * Declared here to avoid circular dependency
 */
export interface ITimeEntryMethods {
  calculateTotalHours(): number
}

/** Document of a {@link TimeEntry}, as stored in the database. */
export interface ITimeEntry extends Document, ITimeEntryMethods {
  employeeId: Types.ObjectId
  date: string // Format "YYYY-MM-DD"
  clockIn: string // Format "HH:mm"
  clockOut?: string | null // Format "HH:mm"
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY'
  errorMessage?: string
  isOutOfSchedule?: boolean // True if clocked in/out outside of scheduled shift (±15min)
  justificationNote?: string // Note explaining why the employee clocked in/out outside schedule
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/** Schema used to validate TimeEntry objects for the database. */
export const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    clockIn: {
      type: String,
      required: [true, 'Clock in time is required'],
      match: [/^\d{2}:\d{2}$/, 'Clock in must be in HH:mm format'],
    },
    clockOut: {
      type: String,
      default: null,
      match: [/^\d{2}:\d{2}$/, 'Clock out must be in HH:mm format'],
    },
    shiftNumber: {
      type: Number,
      required: [true, 'Shift number is required'],
      enum: [1, 2],
      default: 1,
    },
    totalHours: {
      type: Number,
      min: [0, 'Total hours cannot be negative'],
      max: [24, 'Total hours cannot exceed 24'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    errorType: {
      type: String,
      enum: ['MISSING_CLOCK_OUT', 'INVALID_TIME_RANGE', 'DUPLICATE_ENTRY'],
    },
    errorMessage: {
      type: String,
    },
    isOutOfSchedule: {
      type: Boolean,
      default: false,
    },
    justificationNote: {
      type: String,
      maxlength: [500, 'La note de justification ne peut pas dépasser 500 caractères'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
TimeEntrySchema.index({ employeeId: 1, date: 1 })
TimeEntrySchema.index({ employeeId: 1, date: 1, shiftNumber: 1 }, { unique: true })
TimeEntrySchema.index({ status: 1, isActive: 1 })
TimeEntrySchema.index({ date: 1, status: 1 })
