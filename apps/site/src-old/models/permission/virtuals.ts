import { PermissionDocument, PermissionSchema } from "./document";

/** Virtual object derived from the {@link PermissionSchema}. */
export interface VirtualPermission extends PermissionDocument {
  readonly fullIdentifier: string;
  readonly isManagePermission: boolean;
}

// Virtual for full identifier (resource:action)
PermissionSchema.virtual("fullIdentifier").get(function (
  this: PermissionDocument
) {
  return `${this.resource}:${this.action}`;
});

// Virtual to check if this is a manage permission
PermissionSchema.virtual("isManagePermission").get(function (
  this: PermissionDocument
) {
  return this.action === "manage";
});
