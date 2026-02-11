import { Schema, Document, Types } from 'mongoose';

/**
 * Interface RecurringTask Document
 * Template for recurring tasks that auto-generate task instances
 */
export interface RecurringTaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  recurrenceType: 'weekly' | 'monthly';
  recurrenceDays: number[]; // weekly: 0-6 (0=Sunday), monthly: 1-31
  active: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const RecurringTaskSchema = new Schema<RecurringTaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    recurrenceType: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    recurrenceDays: {
      type: [Number],
      required: true,
      validate: {
        validator: function (this: RecurringTaskDocument, days: number[]) {
          if (!days || days.length === 0) return false;
          if (this.recurrenceType === 'weekly') {
            return days.every((d) => d >= 0 && d <= 6);
          }
          return days.every((d) => d >= 1 && d <= 31);
        },
        message: 'Invalid recurrence days for the given type',
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

RecurringTaskSchema.index({ active: 1, recurrenceType: 1 });
RecurringTaskSchema.index({ createdBy: 1 });
