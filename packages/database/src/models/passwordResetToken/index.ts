import mongoose from "mongoose";
import {
  PasswordResetTokenDocument,
  PasswordResetTokenSchema,
} from "./document";

const PasswordResetToken =
  (mongoose.models
    .PasswordResetToken as mongoose.Model<PasswordResetTokenDocument>) ||
  mongoose.model<PasswordResetTokenDocument>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  );

export default PasswordResetToken;
export type { PasswordResetTokenDocument };
