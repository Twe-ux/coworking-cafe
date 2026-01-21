import { Schema, Document, Types } from 'mongoose';

/**
 * Session Document Interface
 * NextAuth session storage
 */
export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session Schema
 * Used by NextAuth for session management
 */
export const SessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    sessionToken: {
      type: String,
      required: [true, 'Session token is required'],
      unique: true,
    },
    expires: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
SessionSchema.index({ sessionToken: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup
