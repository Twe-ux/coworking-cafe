import { EventRegistrationSchema } from "./document";

let hooksAttached = false;

/**
 * Attach hooks to EventRegistrationSchema
 * Guards against multiple attachments
 */
export function attachHooks(): void {
  if (hooksAttached) {
    return;
  }

  // Pre-save hook: Set registeredAt if not provided
  EventRegistrationSchema.pre("save", async function (next) {
    if (this.isNew && !this.registeredAt) {
      this.registeredAt = new Date().toISOString().split("T")[0];
    }
    next();
  });

  hooksAttached = true;
}
