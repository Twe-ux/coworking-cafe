import bcrypt from "bcryptjs";
import { UserDocument, UserSchema } from "./document";

export interface UserMethods extends UserDocument {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
