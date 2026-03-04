import { Schema, Types, Document } from 'mongoose';

/**
 * Affected shift during absence period
 */
export interface IAffectedShift {
  date: string; // YYYY-MM-DD
  shiftNumber: 1 | 2;
  scheduledHours: number;
}

/**
 * Methods interface for Absence
 */
export interface IAbsenceMethods {
  calculateTotalHours(): number;
}

/**
 * Document of an Absence, as stored in the database
 */
export interface IAbsence extends Document, IAbsenceMethods {
  employeeId: Types.ObjectId;
  type: 'unavailability' | 'paid_leave' | 'sick_leave';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected';
  affectedShifts: IAffectedShift[];
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  reason?: string;
  adminNotes?: string;
  totalHours: number;
  paidHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema used to validate Absence objects for the database
 */
export const AbsenceSchema = new Schema<IAbsence>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Absence type is required'],
      enum: {
        values: ['unavailability', 'paid_leave', 'sick_leave'],
        message: 'Type must be unavailability, paid_leave, or sick_leave',
      },
      index: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'],
      index: true,
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
      index: true,
    },
    affectedShifts: {
      type: [
        {
          date: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
          },
          shiftNumber: {
            type: Number,
            required: true,
            enum: [1, 2],
          },
          scheduledHours: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    reason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    adminNotes: {
      type: String,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    },
    totalHours: {
      type: Number,
      required: true,
      min: [0, 'Total hours cannot be negative'],
      default: 0,
    },
    paidHours: {
      type: Number,
      required: true,
      min: [0, 'Paid hours cannot be negative'],
      default: 0,
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
AbsenceSchema.index({ employeeId: 1, startDate: 1 });
AbsenceSchema.index({ employeeId: 1, status: 1 });
AbsenceSchema.index({ status: 1, isActive: 1 });
AbsenceSchema.index({ startDate: 1, endDate: 1 });
AbsenceSchema.index({ type: 1, status: 1 });
