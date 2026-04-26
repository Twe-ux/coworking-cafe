import bcrypt from "bcryptjs";
import { UserDocument, UserSchema } from "./document";

export interface UserMethods extends UserDocument {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const METHODS_KEY = "__userMethodsAttached" as const;

export function attachMethods() {
  if ((UserSchema as unknown as Record<string, unknown>)[METHODS_KEY]) return;
  (UserSchema as unknown as Record<string, unknown>)[METHODS_KEY] = true;

  UserSchema.methods.comparePassword = async function (
    this: UserDocument,
    candidatePassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  };
}
