import { RoleDocument, RoleSchema } from "./document";

/** Virtual object derived from the {@link RoleSchema} for system roles. */
export interface VirtualSystemRole extends RoleDocument {
  readonly isSystem: true;
  readonly canDelete: false;
}

/** Virtual object derived from the {@link RoleSchema} for custom roles. */
export interface VirtualCustomRole extends RoleDocument {
  readonly isSystem: false;
  readonly canDelete: true;
}

export type VirtualRole = VirtualSystemRole | VirtualCustomRole;

// Insert the virtuals into the RoleSchema
RoleSchema.virtual("canDelete").get(function (this: RoleDocument) {
  return !this.isSystem;
});

RoleSchema.virtual("permissionCount").get(function (this: RoleDocument) {
  return this.permissions.length;
});
