import { ObjectId, Schema, Types, Document } from "mongoose";

/** Document of a {@link User}, as stored in the databse. */
export interface UserDocument extends Document {
  email: string;
  password: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  role: ObjectId;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  newsletter: boolean;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate User objects for the database. */
export const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    username: { type: String, trim: true },
    givenName: { type: String, trim: true },
    phone: { type: String, trim: true },
    companyName: { type: String, trim: true },
    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: [true, "User role is required"],
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
    isTemporary: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ deletedAt: 1 });
