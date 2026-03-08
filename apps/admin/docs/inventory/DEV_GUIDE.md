# Guide Developpeur - Module Inventory

## API Routes

### Suppliers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/suppliers` | Liste (search, category, active) | staff+ |
| POST | `/api/inventory/suppliers` | Creer | admin+ |
| GET | `/api/inventory/suppliers/[id]` | Detail | staff+ |
| PUT | `/api/inventory/suppliers/[id]` | Modifier | admin+ |
| DELETE | `/api/inventory/suppliers/[id]` | Soft delete (isActive=false) | admin+ |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/products` | Liste (search, category, supplierId, lowStock, active) | staff+ |
| GET | `/api/inventory/products/low-stock` | Produits stock faible | staff+ |
| POST | `/api/inventory/products` | Creer | admin+ |
| GET | `/api/inventory/products/[id]` | Detail | staff+ |
| PUT | `/api/inventory/products/[id]` | Modifier | admin+ |
| DELETE | `/api/inventory/products/[id]` | Soft delete | admin+ |

### Inventory Entries

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/entries` | Liste (status, type, dates) | staff+ |
| POST | `/api/inventory/entries` | Creer draft | staff+ |
| GET | `/api/inventory/entries/[id]` | Detail | staff+ |
| PUT | `/api/inventory/entries/[id]` | Update items (auto-save) | staff+ |
| DELETE | `/api/inventory/entries/[id]` | Supprimer draft | staff+ |
| POST | `/api/inventory/entries/[id]/finalize` | Finaliser + StockMovements | staff+ |

### Purchase Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/purchase-orders/suggestions?supplierId=xxx` | Suggestions auto | staff+ |
| GET | `/api/inventory/purchase-orders` | Liste (status, supplierId) | staff+ |
| POST | `/api/inventory/purchase-orders` | Creer draft | staff+ |
| GET | `/api/inventory/purchase-orders/[id]` | Detail | staff+ |
| PUT | `/api/inventory/purchase-orders/[id]` | Modifier draft | staff+ |
| POST | `/api/inventory/purchase-orders/[id]/validate` | Valider | admin+ |
| POST | `/api/inventory/purchase-orders/[id]/send-email` | Envoyer email | admin+ |
| POST | `/api/inventory/purchase-orders/[id]/receive` | Receptionner | staff+ |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/analytics/stock-value` | Valeur stock (category, supplierId) | admin+ |
| GET | `/api/inventory/analytics/ca-ratio` | Ratio CA/Stock (period, dates) | admin+ |
| GET | `/api/inventory/analytics/consumption-trends` | Tendances (period, category) | admin+ |
| GET | `/api/inventory/analytics/supplier-performance` | Performance fournisseurs | admin+ |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/inventory/tasks/setup` | Creer templates recurrents (idempotent) | admin+ |
| GET | `/api/inventory/tasks/pending` | Taches inventaire pending | staff+ |
| POST | `/api/inventory/tasks/[id]/complete` | Completer tache | staff+ |
| POST | `/api/inventory/tasks/check-low-stock` | Creer alertes (idempotent) | admin+ |

---

## Types TypeScript

Tous dans `src/types/inventory.ts` (339 lignes).

### Models principaux

```typescript
interface Supplier {
  _id: string; name: string; contact: string; email: string;
  phone: string; address?: string; categories: ("food"|"cleaning")[];
  paymentTerms?: string; notes?: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

interface Product {
  _id: string; name: string; category: ProductCategory; unit: ProductUnit;
  unitPriceHT: number; vatRate: number; supplierId: string;
  supplierName?: string; minStock: number; maxStock: number;
  currentStock: number; hasShortDLC: boolean; isActive: boolean;
  createdAt: string; updatedAt: string;
}

interface PurchaseOrder {
  _id: string; orderNumber: string; supplierId: string;
  supplierName: string; items: PurchaseOrderItem[];
  status: OrderStatus; totalHT: number; totalTTC: number;
  createdBy?: string; validatedBy?: string; validatedAt?: string;
  sentAt?: string; receivedAt?: string; receivedBy?: string;
  notes?: string; createdAt: string; updatedAt: string;
}
```

### Enums

```typescript
type ProductCategory = "food" | "cleaning"
type ProductUnit = "kg" | "L" | "unit" | "pack"
type InventoryType = "monthly" | "weekly"
type MovementType = "inventory_adjustment" | "purchase_reception" | "manual"
type OrderStatus = "draft" | "validated" | "sent" | "received"
```

---

## Hooks Custom

### useSuppliers
```typescript
const { suppliers, loading, error, deleteSupplier } = useSuppliers(filters)
```

### useProducts
```typescript
const { products, loading, error, deleteProduct } = useProducts(filters)
```

### useInventoryEntry (auto-save)
```typescript
const { entry, loading, updateItem, finalizeEntry } = useInventoryEntry(id)
// updateItem declenche auto-save debounced (1s)
```

### useAnalytics
```typescript
const { stockValue, caRatio, trends, supplierPerf, loading } = useAnalytics(filters)
```

### useInventoryTasks
```typescript
const { pendingTasks, setupTemplates, checkLowStock, completeTask } = useInventoryTasks()
```

### useInventoryKpis
```typescript
const { totalProducts, stockValue, lowStockCount, loading } = useInventoryKpis()
```

---

## Helpers

### transformProductForAPI (`lib/inventory/helpers.ts`)
```typescript
import { transformProductForAPI } from '@/lib/inventory/helpers'

// Converts ObjectId -> string, populated supplier -> flat, Date -> YYYY-MM-DD
const apiProduct = transformProductForAPI(mongooseDoc)
```

### transformOrder (`lib/inventory/orderHelpers.ts`)
```typescript
import { transformOrder } from '@/lib/inventory/orderHelpers'

// Same pattern for PurchaseOrder documents
const apiOrder = transformOrder(mongooseDoc)
```

### Permissions (`lib/inventory/permissions.ts`)
```typescript
import { getRequiredRoles } from '@/lib/inventory/permissions'

// In API routes
const authResult = await requireAuth(getRequiredRoles('viewProducts'))

// Available keys: viewProducts, manageProducts, viewSuppliers, manageSuppliers,
// viewOrders, createOrderDraft, validateOrder, sendOrder, receiveStock,
// viewAnalytics, manageTasks
```

### useInventoryPermissions (`lib/inventory/usePermissions.ts`)
```typescript
// In React components
const { canManageSuppliers, canManageProducts, isReadOnly } = useInventoryPermissions()
```

---

## Exemples d'Utilisation

### Creer un produit
```typescript
const response = await fetch('/api/inventory/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Lait entier',
    category: 'food',
    unit: 'L',
    unitPriceHT: 1.20,
    vatRate: 5.5,
    supplierId: 'xxx',
    minStock: 10,
    maxStock: 50,
    hasShortDLC: true,
  }),
})
```

### Creer et valider une commande
```typescript
// 1. Get suggestions
const suggestionsRes = await fetch('/api/inventory/purchase-orders/suggestions?supplierId=xxx')
const { data: { suggestions } } = await suggestionsRes.json()

// 2. Create draft
const orderRes = await fetch('/api/inventory/purchase-orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplierId: 'xxx',
    items: suggestions.map(s => ({ productId: s.productId, quantity: s.suggestedQuantity })),
  }),
})
const { data: order } = await orderRes.json()

// 3. Validate
await fetch(`/api/inventory/purchase-orders/${order._id}/validate`, { method: 'POST' })

// 4. Send email
await fetch(`/api/inventory/purchase-orders/${order._id}/send-email`, { method: 'POST' })

// 5. Receive
await fetch(`/api/inventory/purchase-orders/${order._id}/receive`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: order.items.map(i => ({ productId: i.productId, receivedQty: i.quantity })),
  }),
})
```

### Finaliser un inventaire
```typescript
const response = await fetch(`/api/inventory/entries/${entryId}/finalize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ taskId: 'xxx' }), // Optional
})
// -> Creates StockMovements, updates currentStock, completes Task
```
