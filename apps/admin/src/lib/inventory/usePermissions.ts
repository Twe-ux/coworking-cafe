"use client"

/**
 * Inventory Module - UI Permissions Hook
 *
 * React hook for checking user permissions in components.
 */

import { useSession } from "next-auth/react"
import {
  type UserRole,
  type PermissionKey,
  hasPermission,
  canManageSuppliers,
  canManageProducts,
  canValidateOrders,
  canSendOrders,
  canViewAnalytics,
  isReadOnly,
  getUserPermissions,
} from "./permissions"

// ============================================================================
// Hook Return Type
// ============================================================================

export interface InventoryPermissions {
  role: UserRole | null
  loading: boolean

  // Permission checkers
  hasPermission: (permission: PermissionKey) => boolean
  canManageSuppliers: () => boolean
  canManageProducts: () => boolean
  canValidateOrders: () => boolean
  canSendOrders: () => boolean
  canViewAnalytics: () => boolean

  // Read-only mode
  isReadOnly: (resource: "suppliers" | "products") => boolean

  // Get all permissions
  getAllPermissions: () => PermissionKey[]
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to check user permissions for inventory operations
 *
 * @example
 * ```tsx
 * function SupplierList() {
 *   const { canManageSuppliers, isReadOnly } = useInventoryPermissions()
 *
 *   return (
 *     <div>
 *       {canManageSuppliers() && (
 *         <Button>Add Supplier</Button>
 *       )}
 *       {isReadOnly('suppliers') && (
 *         <Alert>Read-only mode</Alert>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useInventoryPermissions(): InventoryPermissions {
  const { data: session, status } = useSession()

  const userRole = (session?.user?.role as UserRole) || null
  const loading = status === "loading"

  return {
    role: userRole,
    loading,

    // Permission checkers
    hasPermission: (permission: PermissionKey) => {
      if (!userRole) return false
      return hasPermission(userRole, permission)
    },

    canManageSuppliers: () => {
      if (!userRole) return false
      return canManageSuppliers(userRole)
    },

    canManageProducts: () => {
      if (!userRole) return false
      return canManageProducts(userRole)
    },

    canValidateOrders: () => {
      if (!userRole) return false
      return canValidateOrders(userRole)
    },

    canSendOrders: () => {
      if (!userRole) return false
      return canSendOrders(userRole)
    },

    canViewAnalytics: () => {
      if (!userRole) return false
      return canViewAnalytics(userRole)
    },

    // Read-only mode
    isReadOnly: (resource: "suppliers" | "products") => {
      if (!userRole) return true
      return isReadOnly(userRole, resource)
    },

    // Get all permissions
    getAllPermissions: () => {
      if (!userRole) return []
      return getUserPermissions(userRole)
    },
  }
}
