import { SessionSchema } from './document';

/**
 * Virtual: expiresIn
 * Returns time until expiration in milliseconds
 */
SessionSchema.virtual('expiresIn').get(function () {
  return this.expires.getTime() - Date.now();
});
