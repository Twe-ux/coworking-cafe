/**
 * Inventory Module - Permissions & Security Helpers
 *
 * Defines role-based access control for inventory operations.
 */

// ============================================================================
// Permission Matrix
// ============================================================================

export const INVENTORY_PERMISSIONS = {
  // Suppliers
  viewSuppliers: ['dev', 'admin', 'staff'],
  manageSuppliers: ['dev', 'admin'],

  // Products
  viewProducts: ['dev', 'admin', 'staff'],
  manageProducts: ['dev', 'admin'],

  // Inventory
  viewInventory: ['dev', 'admin', 'staff'],
  createInventory: ['dev', 'admin', 'staff'],

  // Stock Movements
  viewMovements: ['dev', 'admin', 'staff'],
  createMovement: ['dev', 'admin', 'staff'],

  // Purchase Orders
  viewOrders: ['dev', 'admin', 'staff'],
  createOrderDraft: ['dev', 'admin', 'staff'],
  validateOrder: ['dev', 'admin'],
  sendOrder: ['dev', 'admin'],
  receiveStock: ['dev', 'admin', 'staff'],

  // Analytics
  viewAnalytics: ['dev', 'admin'],
} as const

// ============================================================================
// Type Definitions
// ============================================================================

export type UserRole = 'dev' | 'admin' | 'staff'
export type PermissionKey = keyof typeof INVENTORY_PERMISSIONS

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: PermissionKey
): boolean {
  const allowedRoles = INVENTORY_PERMISSIONS[permission] as readonly string[]
  return allowedRoles.includes(userRole)
}

/**
 * Check if user can manage suppliers (create, update, delete)
 */
export function canManageSuppliers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manageSuppliers')
}

/**
 * Check if user can manage products (create, update, delete)
 */
export function canManageProducts(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manageProducts')
}

/**
 * Check if user can validate purchase orders
 */
export function canValidateOrders(userRole: UserRole): boolean {
  return hasPermission(userRole, 'validateOrder')
}

/**
 * Check if user can send purchase orders to suppliers
 */
export function canSendOrders(userRole: UserRole): boolean {
  return hasPermission(userRole, 'sendOrder')
}

/**
 * Check if user can view analytics dashboard
 */
export function canViewAnalytics(userRole: UserRole): boolean {
  return hasPermission(userRole, 'viewAnalytics')
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(userRole: UserRole): PermissionKey[] {
  return Object.entries(INVENTORY_PERMISSIONS)
    .filter(([_, roles]) => (roles as readonly string[]).includes(userRole))
    .map(([key]) => key as PermissionKey)
}

// ============================================================================
// Read-Only Mode Helper
// ============================================================================

/**
 * Determine if user is in read-only mode for a specific resource
 */
export function isReadOnly(userRole: UserRole, resource: 'suppliers' | 'products'): boolean {
  if (resource === 'suppliers') {
    return !canManageSuppliers(userRole)
  }
  if (resource === 'products') {
    return !canManageProducts(userRole)
  }
  return false
}

// ============================================================================
// API Route Guards
// ============================================================================

/**
 * Get required roles for an API endpoint
 *
 * Usage in API routes:
 * ```typescript
 * const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
 * ```
 */
export function getRequiredRoles(permission: PermissionKey): UserRole[] {
  return [...INVENTORY_PERMISSIONS[permission]]
}
