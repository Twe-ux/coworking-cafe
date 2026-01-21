import { Schema, Types, Document } from 'mongoose';

/**
 * Availability Document Interface
 * Employee availability patterns
 */
export interface AvailabilityDocument extends Document {
  employeeId: Types.ObjectId;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Availability Schema
 * Used for scheduling employee availability
 */
export const AvailabilitySchema = new Schema<AvailabilityDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required'],
      enum: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (v: number) => v >= 0 && v <= 6,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
      },
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: 'Start time must be in HH:mm format',
      },
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
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
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AvailabilitySchema.index({ employeeId: 1, dayOfWeek: 1, startTime: 1, isActive: 1 });
