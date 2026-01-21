import { Schema, Types, Document } from 'mongoose';

/**
 * Shift Document Interface
 * Planned work shifts for employees
 */
export interface ShiftDocument extends Document {
  employeeId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shift Schema
 * Used for employee scheduling
 */
export const ShiftSchema = new Schema<ShiftDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format (HH:mm)',
      },
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format (HH:mm)',
      },
    },
    type: {
      type: String,
      required: [true, 'Shift type is required'],
      trim: true,
      maxlength: [50, 'Shift type cannot exceed 50 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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
ShiftSchema.index({ employeeId: 1, date: 1, startTime: 1 }, { unique: true });
ShiftSchema.index({ date: 1, isActive: 1 });
