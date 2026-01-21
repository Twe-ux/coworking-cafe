import { UserDocument, UserSchema } from "./document";

/** Virtual object dervied from the {@link UserSchema} when a user was validated. */
export interface VirtualValidatedUser extends UserDocument {
  readonly isEmailVerified: true;
  emailVerifiedAt: Date;
}

/** Virtual object dervied from the {@link UserSchema} when a user has not validated their email address yet. */
export interface VirtualUnvalidatedUser extends UserDocument {
  readonly isEmailVerified: false;
  emailVerifiedAt?: undefined;
}

/** Virtual object dervied from the {@link UserSchema} when a user is currently active. */
export interface VirtualActiveUser extends UserDocument {
  readonly isActive: true;
  deletedAt?: undefined;
}

/** Virtual object dervied from the {@link UserSchema} when a user has been deleted. */
export interface VirtualInactiveUser extends UserDocument {
  readonly isActive: false;
  deletedAt: Date;
}

export type VirtualUser = (VirtualValidatedUser | VirtualUnvalidatedUser) &
  (VirtualActiveUser | VirtualInactiveUser);

// Insert the virtuals into the UserSchema
UserSchema.virtual("isEmailVerified").get(function (this: UserDocument) {
  return !!this.emailVerifiedAt;
});

UserSchema.virtual("isActive").get(function (this: UserDocument) {
  return !this.deletedAt;
});
