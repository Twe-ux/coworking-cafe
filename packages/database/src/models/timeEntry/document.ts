import { Schema, Types, Document } from 'mongoose';

/**
 * TimeEntry Document Interface
 * Tracks employee clock-in and clock-out times
 */
export interface TimeEntryDocument extends Document {
  employeeId: Types.ObjectId;
  date: string;
  clockIn: string;
  clockOut?: string | null;
  shiftNumber: 1 | 2;
  totalHours?: number;
  status: 'active' | 'completed';
  hasError?: boolean;
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY';
  errorMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TimeEntry Schema
 * Used for employee time tracking
 */
export const TimeEntrySchema = new Schema<TimeEntryDocument>(
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
      min: 0,
      max: 24,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
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
TimeEntrySchema.index({ employeeId: 1, date: 1 });
TimeEntrySchema.index({ employeeId: 1, date: 1, shiftNumber: 1 }, { unique: true });
TimeEntrySchema.index({ status: 1, isActive: 1 });
TimeEntrySchema.index({ date: 1, status: 1 });
