import { SessionDocument, SessionSchema } from "./document";

export interface SessionMethods extends SessionDocument {
  isExpired(): boolean;
  isRefreshExpired(): boolean;
  revoke(): Promise<void>;
  updateActivity(): Promise<void>;
}

/** Check if the session token has expired */
SessionSchema.methods.isExpired = function (this: SessionDocument): boolean {
  return new Date() > this.expiresAt;
};

/** Check if the refresh token has expired */
SessionSchema.methods.isRefreshExpired = function (
  this: SessionDocument
): boolean {
  return new Date() > this.refreshExpiresAt;
};

/** Revoke the session by marking it as inactive */
SessionSchema.methods.revoke = async function (
  this: SessionDocument
): Promise<void> {
  this.isActive = false;
  await this.save();
};

/** Update last activity timestamp */
SessionSchema.methods.updateActivity = async function (
  this: SessionDocument
): Promise<void> {
  this.lastActivityAt = new Date();
  await this.save();
};
