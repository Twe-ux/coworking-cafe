import bcrypt from "bcryptjs";
import { UserSchema } from "./document";

export function attachHooks() {
  // Hash le password avant de sauvegarder
  UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      // Si le password est modifié, mettre à jour passwordChangedAt
      if (!this.isNew) {
        this.passwordChangedAt = new Date();
      }

      next();
    } catch (error: any) {
      next(error);
    }
  });
}
