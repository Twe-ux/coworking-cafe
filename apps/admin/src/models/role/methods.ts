import { RoleDocument, RoleSchema } from "./document";
import { HydratedDocument } from "mongoose";

export interface RoleMethods extends RoleDocument {
  hasPermission(permissionSlug: string): Promise<boolean>;
  canManageUsers(): boolean;
}

interface PopulatedPermission {
  slug: string;
  [key: string]: unknown;
}

/** Check if role has a specific permission */
RoleSchema.methods.hasPermission = async function (
  this: HydratedDocument<RoleDocument>,
  permissionSlug: string
): Promise<boolean> {
  await this.populate("permissions");
  const permissions = this.permissions as unknown as PopulatedPermission[];
  return permissions.some((p) => p.slug === permissionSlug);
};

/** Check if role can manage users (admin or dev only) */
RoleSchema.methods.canManageUsers = function (this: RoleDocument): boolean {
  return this.slug === "dev" || this.slug === "admin";
};
