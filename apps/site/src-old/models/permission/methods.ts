import { PermissionDocument, PermissionSchema } from "./document";

export interface PermissionMethods extends PermissionDocument {
  getFullName(): string;
  isActionAllowed(action: string): boolean;
}

/** Get formatted full name (resource:action) */
PermissionSchema.methods.getFullName = function (
  this: PermissionDocument
): string {
  return `${this.resource}:${this.action}`;
};

/** Check if a specific action matches this permission's action */
PermissionSchema.methods.isActionAllowed = function (
  this: PermissionDocument,
  action: string
): boolean {
  // 'manage' action allows all other actions
  if (this.action === "manage") return true;
  return this.action === action;
};
