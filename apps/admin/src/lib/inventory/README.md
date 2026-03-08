# Inventory Library

Utility functions and helpers for the Inventory Management module.

## 📁 Files

### `permissions.ts`
Role-based access control helpers for inventory operations.

**Exports**:
- `INVENTORY_PERMISSIONS` - Permission matrix
- `hasPermission(role, permission)` - Check if role has permission
- `canManageSuppliers(role)` - Check supplier management permission
- `canManageProducts(role)` - Check product management permission
- `canValidateOrders(role)` - Check order validation permission
- `canSendOrders(role)` - Check order sending permission
- `canViewAnalytics(role)` - Check analytics access permission
- `isReadOnly(role, resource)` - Check if resource is read-only
- `getRequiredRoles(permission)` - Get roles for API route

**Usage in API Routes**:
```typescript
import { getRequiredRoles } from '@/lib/inventory/permissions'
import { requireAuth } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
  if (!authResult.authorized) return authResult.response

  // Logic...
}
```

### `usePermissions.ts`
React hook for UI permission checks.

**Export**:
- `useInventoryPermissions()` - Hook returning permission checkers

**Usage in Components**:
```tsx
import { useInventoryPermissions } from '@/lib/inventory/usePermissions'

function SupplierList() {
  const { canManageSuppliers, isReadOnly } = useInventoryPermissions()

  return (
    <>
      {canManageSuppliers() && <Button>Add Supplier</Button>}
      {isReadOnly('suppliers') && <Alert>Read-only mode</Alert>}
    </>
  )
}
```

## 🔒 Permission Matrix

| Action | Admin | Staff |
|--------|-------|-------|
| View suppliers | ✅ | ✅ (read-only) |
| Manage suppliers | ✅ | ❌ |
| View products | ✅ | ✅ |
| Manage products | ✅ | ❌ |
| Create inventory | ✅ | ✅ |
| View analytics | ✅ | ❌ |
| Create order draft | ✅ | ✅ |
| Validate/send order | ✅ | ❌ |
| Receive stock | ✅ | ✅ |

## 📚 Documentation

See [SECURITY.md](../../docs/guides/SECURITY.md) for complete security guidelines.

## 🚧 Future Additions

This directory will also contain:
- API helpers (fetch functions for suppliers, products, etc.)
- Calculation utilities (stock value, variance calculations)
- Validation helpers
- Data transformers
