import bcrypt from "bcryptjs";
import { UserSchema } from "./document";

// Key stored ON the schema object so the flag survives HMR re-execution of this module
const HOOKS_KEY = "__userHooksAttached" as const;

export function attachHooks() {
  // Guard against double-attachment (module-level var resets on HMR, schema object does not)
  if ((UserSchema as unknown as Record<string, unknown>)[HOOKS_KEY]) return;
  (UserSchema as unknown as Record<string, unknown>)[HOOKS_KEY] = true;

  UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      if (!this.isNew) {
        this.passwordChangedAt = new Date();
      }

      next();
    } catch (error: unknown) {
      next(error as Error);
    }
  });
}
