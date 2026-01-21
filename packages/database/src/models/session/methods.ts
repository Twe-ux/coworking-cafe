import { SessionSchema } from './document';

/**
 * Instance Methods for Session Model
 */

/**
 * Check if session is expired
 */
SessionSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expires;
};

/**
 * Check if session is valid
 */
SessionSchema.methods.isValid = function (): boolean {
  return !this.isExpired();
};
