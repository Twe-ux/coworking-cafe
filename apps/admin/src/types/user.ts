/**
 * Types pour la gestion des utilisateurs
 */

import type { Types } from "mongoose";

export interface Role {
  id: string;
  slug: "dev" | "admin" | "staff" | "client" | "newsletter-only";
  name: string;
  level: number;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  role: Role;
  newsletter: boolean;
  emailVerifiedAt?: string; // ISO string YYYY-MM-DD
  lastLoginAt?: string; // ISO string YYYY-MM-DD
  createdAt: string; // ISO string YYYY-MM-DD
  updatedAt: string; // ISO string YYYY-MM-DD
  deletedAt?: string; // ISO string YYYY-MM-DD (soft delete)
  isActive: boolean; // Computed: !deletedAt
  isEmailVerified: boolean; // Computed: !!emailVerifiedAt
}

export interface UserListItem extends User {
  hasAccount: boolean; // Computed: has role and login history
}

export interface UserFormData {
  email: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  roleId: string;
  newsletter: boolean;
  password?: string; // Only for creation
}

export interface UserFilters {
  search?: string; // Search by email, username, givenName
  roleSlug?: "dev" | "admin" | "staff" | "client" | "newsletter-only" | "all";
  isActive?: boolean;
  newsletter?: boolean;
}

export interface UserUpdateData {
  email?: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  roleId?: string;
  newsletter?: boolean;
  activationToken?: string;
  activationTokenExpires?: Date | string;
}

/**
 * User document with populated role (from Mongoose)
 * Used internally in API routes after populate()
 */
export interface PopulatedUserDocument {
  _id: Types.ObjectId | string;
  email: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  role: PopulatedRole;
  newsletter: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Populated role from Mongoose populate()
 */
export interface PopulatedRole {
  _id: Types.ObjectId | string;
  slug: string;
  name: string;
  level: number;
}
