import bcrypt from "bcryptjs";
import { UserSchema } from "./document";

export function attachHooks() {
  // Hash le password avant de sauvegarder
  UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      console.log('[User Hook] Password not modified, skipping hash');
      return next();
    }

    try {
      console.log('[User Hook] Password modified, hashing. Current length:', this.password.length);
      console.log('[User Hook] Password starts with:', this.password.substring(0, 10));

      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      console.log('[User Hook] Password hashed successfully. Hash starts with:', this.password.substring(0, 10));

      // Si le password est modifié, mettre à jour passwordChangedAt
      if (!this.isNew) {
        this.passwordChangedAt = new Date();
      }

      next();
    } catch (error: any) {
      console.error('[User Hook] Error hashing password:', error);
      next(error);
    }
  });
}
