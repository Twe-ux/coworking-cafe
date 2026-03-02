'use client'

import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'
import {
  canManageSuppliers,
  canManageProducts,
  canValidateOrders,
  canViewAnalytics,
  type UserRole,
} from '@/lib/inventory/permissions'

// ============================================================================
// Types
// ============================================================================

/**
 * Available permission types for inventory module
 */
export type InventoryPermissionType =
  | 'manageSuppliers'
  | 'manageProducts'
  | 'validateOrders'
  | 'viewAnalytics'

interface PermissionGuardProps {
  /**
   * Content to render when user has permission
   */
  children: ReactNode

  /**
   * Required permission to view children
   */
  require: InventoryPermissionType

  /**
   * Optional fallback content to render when permission is denied
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode
}

// ============================================================================
// Permission Checker Functions
// ============================================================================

/**
 * Permission checker mapping
 */
const permissionCheckers: Record<
  InventoryPermissionType,
  (role: UserRole) => boolean
> = {
  manageSuppliers: canManageSuppliers,
  manageProducts: canManageProducts,
  validateOrders: canValidateOrders,
  viewAnalytics: canViewAnalytics,
}

/**
 * Check if user has the required permission
 */
function checkPermission(
  role: string,
  permission: InventoryPermissionType
): boolean {
  // Ensure role is valid
  if (role !== 'dev' && role !== 'admin' && role !== 'staff') {
    return false
  }

  const checker = permissionCheckers[permission]
  return checker(role as UserRole)
}

// ============================================================================
// Component
// ============================================================================

/**
 * PermissionGuard - Conditional rendering based on user permissions
 *
 * @example
 * ```tsx
 * // Hide edit button for staff
 * <PermissionGuard require="manageSuppliers">
 *   <Button onClick={handleEdit}>Modifier</Button>
 * </PermissionGuard>
 *
 * // Show fallback message for unauthorized users
 * <PermissionGuard
 *   require="viewAnalytics"
 *   fallback={<Alert>Accès réservé aux administrateurs</Alert>}
 * >
 *   <AnalyticsDashboard />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  require: requiredPermission,
  fallback = null,
}: PermissionGuardProps) {
  const { data: session, status } = useSession()

  // Loading state - render nothing
  if (status === 'loading') {
    return null
  }

  // No session - render fallback
  if (!session?.user) {
    return <>{fallback}</>
  }

  // Get user role
  const userRole = session.user.role

  // Check permission
  const hasPermission = checkPermission(userRole, requiredPermission)

  // Render children if authorized, fallback otherwise
  if (hasPermission) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
