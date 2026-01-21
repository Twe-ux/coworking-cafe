import bcrypt from "bcryptjs";
import { connectToDatabase } from "@coworking-cafe/database";
import { User, Role, Permission } from "@coworking-cafe/database";
import type { UserDocument } from "@coworking-cafe/database/src/models/user/document";
import type { RoleDocument } from "@coworking-cafe/database/src/models/role/document";
import type { PermissionDocument } from "@coworking-cafe/database";
import type { Types } from "mongoose";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Find user by email with password field
 */
export async function findUserByEmail(
  email: string
): Promise<(UserDocument & { role: RoleDocument }) | null> {
  await connectToDatabase();
  return User.findOne({ email })
    .select("+password")
    .populate<{ role: RoleDocument }>("role")
    .lean();
}

/**
 * Find user by ID with populated role and permissions
 */
export async function findUserById(userId: string): Promise<
  | (UserDocument & {
      role: RoleDocument & { permissions: PermissionDocument[] };
    })
  | null
> {
  await connectToDatabase();
  return User.findById(userId)
    .populate<{
      role: RoleDocument & { permissions: PermissionDocument[] };
    }>({
      path: "role",
      populate: {
        path: "permissions",
      },
    })
    .lean();
}

interface CreateUserData {
  email: string;
  password: string;
  username?: string;
  givenName?: string;
  roleSlug?: "dev" | "admin" | "staff" | "client";
  newsletter?: boolean;
}

/**
 * Create a new user with a specific role
 * Note: Password will be automatically hashed by the User model's pre-save hook
 */
export async function createUser(data: CreateUserData): Promise<UserDocument> {
  await connectToDatabase();

  // Find role by slug (default to 'client')
  const roleSlug = data.roleSlug || "client";
  const role = await Role.findOne({ slug: roleSlug }).lean();

  if (!role) {
    throw new Error(`Role "${roleSlug}" not found. Please seed roles first.`);
  }

  // Create user with plain password - the pre-save hook will hash it
  const user = await User.create({
    email: data.email,
    password: data.password,
    username: data.username,
    givenName: data.givenName,
    role: role._id,
    newsletter: data.newsletter ?? false,
  });

  return user;
}

interface PopulatedRole extends RoleDocument {
  permissions: PermissionDocument[];
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const user = await findUserById(userId);

  if (!user || !user.role) {
    return false;
  }

  const role = user.role;

  // Dev has all permissions
  if (role.slug === "dev") {
    return true;
  }

  // Check if permission exists in role's permissions
  const permissions = role.permissions || [];
  return permissions.some(
    (permission) =>
      permission.resource === resource && permission.action === action
  );
}

/**
 * Check if user has required role level
 */
export async function hasRoleLevel(
  userId: string,
  requiredLevel: number
): Promise<boolean> {
  const user = await findUserById(userId);

  if (!user || !user.role) {
    return false;
  }

  return user.role.level >= requiredLevel;
}

type RoleSlug = "dev" | "admin" | "staff" | "client";

/**
 * Get user's role slug
 */
export async function getUserRoleSlug(
  userId: string
): Promise<RoleSlug | null> {
  const user = await findUserById(userId);

  if (!user || !user.role) {
    return null;
  }

  return user.role.slug as RoleSlug;
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPathByRole(roleSlug: RoleSlug): string {
  const redirectPaths: Record<RoleSlug, string> = {
    dev: "/dashboard",
    admin: "/dashboard",
    staff: "/dashboard",
    client: "/dashboard",
  };

  return redirectPaths[roleSlug] || "/";
}

interface RoleData {
  name: string;
  slug: RoleSlug;
  description: string;
  level: number;
  isSystem: boolean;
}

/**
 * Initialize default roles if they don't exist
 */
export async function initializeRoles(): Promise<void> {
  await connectToDatabase();

  const roles: RoleData[] = [
    {
      name: "Developer",
      slug: "dev",
      description: "Full system access",
      level: 100,
      isSystem: true,
    },
    {
      name: "Administrator",
      slug: "admin",
      description: "Administrative access",
      level: 80,
      isSystem: true,
    },
    {
      name: "Staff",
      slug: "staff",
      description: "Staff member access",
      level: 50,
      isSystem: true,
    },
    {
      name: "Client",
      slug: "client",
      description: "Client access",
      level: 10,
      isSystem: true,
    },
  ];

  for (const roleData of roles) {
    const exists = await Role.findOne({ slug: roleData.slug }).lean();
    if (!exists) {
      await Role.create(roleData);
    }
  }
}
