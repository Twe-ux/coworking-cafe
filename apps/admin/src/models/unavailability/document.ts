import mongoose, { Schema } from 'mongoose';
import type { IUnavailabilityDocument } from '@/types/unavailability';

const unavailabilitySchema = new Schema<IUnavailabilityDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      index: true,
    },
    endDate: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    requestedBy: {
      type: String,
      enum: ['admin', 'employee'],
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'unavailabilities',
  }
);

// Compound index for date range queries
unavailabilitySchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
unavailabilitySchema.index({ status: 1, createdAt: -1 });

export default unavailabilitySchema;
