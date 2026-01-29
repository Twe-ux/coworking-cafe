import { ObjectId, Schema, Types, Document } from "mongoose";

/** Document of a {@link PasswordResetToken}, as stored in the database. */
export interface PasswordResetTokenDocument extends Document {
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema used to validate PasswordResetToken objects for the database. */
export const PasswordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PasswordResetTokenSchema.index({ token: 1 }, { unique: true });
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 });
