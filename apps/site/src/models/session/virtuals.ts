import { SessionDocument, SessionSchema } from "./document";

/** Virtual object derived from the {@link SessionSchema} for active sessions. */
export interface VirtualActiveSession extends SessionDocument {
  readonly isActive: true;
  readonly isValid: true;
}

/** Virtual object derived from the {@link SessionSchema} for inactive sessions. */
export interface VirtualInactiveSession extends SessionDocument {
  readonly isActive: false;
  readonly isValid: false;
}

export type VirtualSession = VirtualActiveSession | VirtualInactiveSession;

// Virtual to check if session is valid (active and not expired)
SessionSchema.virtual("isValid").get(function (this: SessionDocument) {
  const now = new Date();
  return this.isActive && now < this.expiresAt;
});

// Virtual to check if refresh is valid
SessionSchema.virtual("isRefreshValid").get(function (this: SessionDocument) {
  const now = new Date();
  return this.isActive && now < this.refreshExpiresAt;
});

// Virtual for remaining time in milliseconds
SessionSchema.virtual("remainingTime").get(function (this: SessionDocument) {
  const now = new Date();
  return Math.max(0, this.expiresAt.getTime() - now.getTime());
});
