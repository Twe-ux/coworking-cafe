import { PermissionSchema } from './document';

/**
 * Virtual: fullName
 * Returns formatted permission name
 */
PermissionSchema.virtual('fullName').get(function () {
  return `${this.resource}:${this.action}`;
});
