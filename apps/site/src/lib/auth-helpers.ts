import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import { User } from '@/models/user';
import { Role } from '@/models/role';
import { Permission } from '@/models/permission';
import type { UserDocument } from '@/models/user/document';
import type { RoleDocument } from '@/models/role/document';

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
export async function findUserByEmail(email: string) {
  await connectDB();
  return User.findOne({ email }).select('+password').populate('role');
}

/**
 * Find user by ID with populated role and permissions
 */
export async function findUserById(userId: string) {
  await connectDB();
  return User.findById(userId).populate({
    path: 'role',
    populate: {
      path: 'permissions',
    },
  });
}

/**
 * Create a new user with a specific role
 * Note: Password will be automatically hashed by the User model's pre-save hook
 */
export async function createUser(data: {
  email: string;
  password: string;
  username?: string;
  givenName?: string;
  roleSlug?: 'dev' | 'admin' | 'staff' | 'client';
  newsletter?: boolean;
}) {
  await connectDB();

  // Find role by slug (default to 'client')
  const roleSlug = data.roleSlug || 'client';
  const role = await Role.findOne({ slug: roleSlug });

  if (!role) {
    throw new Error(`Role "${roleSlug}" not found. Please seed roles first.`);
  }

  // Create user with plain password - the pre-save hook will hash it
  const user = await User.create({
    email: data.email,
    password: data.password, // Plain password, will be hashed by pre-save hook
    username: data.username,
    givenName: data.givenName,
    role: role._id,
    newsletter: data.newsletter ?? false,
  });

  return user;
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

  const role = user.role as any;

  // Dev has all permissions
  if (role.slug === 'dev') {
    return true;
  }

  // Check if permission exists in role's permissions
  const permissions = role.permissions || [];
  return permissions.some(
    (permission: any) =>
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

  const role = user.role as any;
  return role.level >= requiredLevel;
}

/**
 * Get user's role slug
 */
export async function getUserRoleSlug(
  userId: string
): Promise<'dev' | 'admin' | 'staff' | 'client' | null> {
  const user = await findUserById(userId);

  if (!user || !user.role) {
    return null;
  }

  const role = user.role as any;
  return role.slug;
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPathByRole(
  roleSlug: 'dev' | 'admin' | 'staff' | 'client'
): string {
  const redirectPaths: Record<string, string> = {
    dev: '/dashboard/dev',
    admin: '/dashboard/admin',
    staff: '/dashboard/staff',
    client: '/id',
  };

  return redirectPaths[roleSlug] || '/';
}

/**
 * Initialize default roles if they don't exist
 */
export async function initializeRoles() {
  await connectDB();

  const roles = [
    {
      name: 'Developer',
      slug: 'dev',
      description: 'Full system access',
      level: 100,
      isSystem: true,
    },
    {
      name: 'Administrator',
      slug: 'admin',
      description: 'Administrative access',
      level: 80,
      isSystem: true,
    },
    {
      name: 'Staff',
      slug: 'staff',
      description: 'Staff member access',
      level: 50,
      isSystem: true,
    },
    {
      name: 'Client',
      slug: 'client',
      description: 'Client access',
      level: 10,
      isSystem: true,
    },
  ];

  for (const roleData of roles) {
    const exists = await Role.findOne({ slug: roleData.slug });
    if (!exists) {
      await Role.create(roleData);    }
  }
}
