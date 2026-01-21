import { PermissionSchema } from './document';

/**
 * Instance Methods for Permission Model
 */

/**
 * Check if this permission allows a specific action
 */
PermissionSchema.methods.allows = function (action: string): boolean {
  return this.action === action || this.action === 'manage';
};

/**
 * Get human-readable permission name
 */
PermissionSchema.methods.getDisplayName = function (): string {
  return `${this.action} ${this.resource}`;
};
