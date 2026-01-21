import { SessionSchema } from "./document";

export function attachHooks() {
  // Update lastActivityAt on save if session is being accessed
  SessionSchema.pre("save", async function (next) {
    if (this.isModified("isActive") && !this.isActive) {
      // Session is being revoked, don't update activity
      return next();
    }

    if (!this.isNew && !this.isModified("lastActivityAt")) {
      // Update activity on any modification except for explicit activity updates
      this.lastActivityAt = new Date();
    }
    next();
  });

  // Prevent reactivation of revoked sessions
  SessionSchema.pre("save", async function (next) {
    if (!this.isNew && this.isModified("isActive")) {
      const wasActive = (this as any)._doc?.isActive;
      if (wasActive === false && this.isActive === true) {
        throw new Error("Cannot reactivate a revoked session");
      }
    }
    next();
  });
}
