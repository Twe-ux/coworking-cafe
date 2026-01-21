import { PermissionSchema } from './document';

/**
 * Pre-save Hook
 * Generate slug from resource and action if not provided
 */
PermissionSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = `${this.resource}.${this.action}`;
  }
  next();
});
