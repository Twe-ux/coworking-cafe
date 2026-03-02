# Architecture - Module Inventory

## Vue d'Ensemble

Systeme complet de gestion de stock avec 5 sous-modules :

- **Fournisseurs** - CRUD avec soft delete
- **Produits** - CRUD + alertes stock faible + lien fournisseur
- **Inventaires** - Saisie hebdo/mensuel + calcul ecarts + StockMovements
- **Commandes** - Workflow 4 etats (draft/validated/sent/received)
- **Analytics** - KPIs, charts recharts, tendances consommation

**Stats** : 78 fichiers, ~5,000 lignes, zero `any`

---

## Structure Dossiers

### Models (`apps/admin/src/models/inventory/`)

```
inventory/
├── supplier/
│   ├── document.ts    # Schema + interfaces
│   └── index.ts       # Registration (dev hot-reload)
├── product/
│   ├── document.ts
│   └── index.ts
├── inventoryEntry/
│   ├── document.ts
│   └── index.ts
├── stockMovement/
│   ├── document.ts
│   └── index.ts
└── purchaseOrder/
    ├── document.ts
    └── index.ts
```

### Types (`apps/admin/src/types/inventory.ts`)

Fichier unique (339 lignes) contenant toutes les interfaces :
- Models : `Supplier`, `Product`, `InventoryEntry`, `StockMovement`, `PurchaseOrder`
- Form data : `SupplierFormData`, `ProductFormData`, `CreatePurchaseOrderData`, etc.
- API responses : `APIResponse<T>`, `StockValueResponse`, `ConsumptionTrendsResponse`, etc.

### API Routes (`apps/admin/src/app/api/inventory/`)

```
inventory/
├── suppliers/
│   ├── route.ts              # GET (list) + POST (create)
│   └── [id]/route.ts         # GET + PUT + DELETE
├── products/
│   ├── route.ts              # GET (list) + POST (create)
│   ├── low-stock/route.ts    # GET (products below minStock)
│   └── [id]/route.ts         # GET + PUT + DELETE
├── entries/
│   ├── route.ts              # GET (list) + POST (create draft)
│   └── [id]/
│       ├── route.ts          # GET + PUT + DELETE
│       └── finalize/route.ts # POST (finalize + StockMovements)
├── purchase-orders/
│   ├── route.ts              # GET (list) + POST (create draft)
│   ├── suggestions/route.ts  # GET (auto-suggestions by supplier)
│   └── [id]/
│       ├── route.ts          # GET + PUT (draft only)
│       ├── validate/route.ts # POST (draft -> validated)
│       ├── send-email/route.ts # POST (validated -> sent)
│       └── receive/route.ts  # POST (sent -> received + StockMovements)
├── analytics/
│   ├── stock-value/route.ts
│   ├── ca-ratio/route.ts
│   ├── consumption-trends/route.ts
│   └── supplier-performance/route.ts
└── tasks/
    ├── setup/route.ts          # POST (create RecurringTask templates)
    ├── pending/route.ts        # GET (pending inventory tasks)
    ├── check-low-stock/route.ts # POST (create alerts, idempotent)
    └── [id]/complete/route.ts  # POST (complete task)
```

### UI Components (`apps/admin/src/components/inventory/`)

```
inventory/
├── index.ts                   # Barrel export
├── PermissionGuard.tsx        # Role-based access wrapper
├── products/
│   ├── index.ts
│   ├── ProductDialog.tsx      # Create/Edit dialog
│   ├── ProductsTable.tsx      # Data table
│   ├── ProductFilters.tsx     # Search + category filters
│   ├── ProductFormFields.tsx  # Form layout
│   ├── ProductBasicFields.tsx # Name, category, unit
│   ├── ProductStockFields.tsx # Min, max, DLC
│   └── LowStockBadge.tsx     # Alert badge
├── suppliers/
│   ├── index.ts
│   ├── SupplierDialog.tsx
│   ├── SuppliersTable.tsx
│   └── SupplierFilters.tsx
├── entries/
│   ├── index.ts
│   ├── InventoryHistory.tsx   # Entry list table
│   ├── InventorySummary.tsx   # Summary card
│   └── ProductInventoryRow.tsx # Single product row
├── analytics/
│   ├── index.ts
│   ├── StockValueCard.tsx     # Pie chart stock value
│   ├── CARatioCard.tsx        # Gauge CA/Stock ratio
│   ├── ConsumptionTrendChart.tsx # Line chart trends
│   ├── SupplierBreakdownChart.tsx # Bar chart suppliers
│   ├── TopProductsTable.tsx   # Top consumed table
│   └── PeriodSelector.tsx     # Period filter
└── tasks/
    ├── index.ts
    └── PendingTasksBanner.tsx # Pending tasks alert banner
```

### Hooks (`apps/admin/src/hooks/inventory/`)

```
inventory/
├── useSuppliers.ts         # CRUD suppliers
├── useProducts.ts          # CRUD products
├── useInventoryEntries.ts  # List entries
├── useInventoryEntry.ts    # Single entry + debounced auto-save
├── useAnalytics.ts         # All analytics data
├── useInventoryTasks.ts    # Pending tasks + setup + complete
└── useInventoryKpis.ts     # Index page KPIs
```

### Helpers (`apps/admin/src/lib/inventory/`)

```
inventory/
├── helpers.ts              # transformProductForAPI()
├── orderHelpers.ts         # transformOrder()
├── permissions.ts          # getRequiredRoles(), hasPermission()
├── usePermissions.ts       # useInventoryPermissions() hook
└── notifications.ts        # Placeholder notifications
```

---

## Flow de Donnees

### Flux Inventaire

```
1. POST /tasks/setup        -> Cree RecurringTask hebdo + mensuel
2. POST /tasks/recurring/sync -> Cree Task instances (cron ou manuel)
3. Staff -> Dashboard        -> PendingTasksBanner -> "Demarrer"
4. Redirect                  -> /inventory/new?taskId=xxx&type=weekly
5. POST /entries             -> Cree InventoryEntry draft (items pre-remplis)
6. PUT /entries/[id]         -> Auto-save items (debounced)
7. POST /entries/[id]/finalize ->
   a. Cree StockMovements (type: inventory_adjustment)
   b. Update Product.currentStock ($inc variance)
   c. Complete Task (si taskId present)
```

### Flux Commande

```
1. GET /suggestions?supplierId=xxx  -> Produits stock faible
2. POST /purchase-orders            -> Cree draft (PO-YYYYMMDD-XXX)
3. POST /[id]/validate              -> draft -> validated (admin only)
4. POST /[id]/send-email            -> validated -> sent (email fournisseur)
5. POST /[id]/receive               ->
   a. sent -> received
   b. Cree StockMovements (type: purchase_reception)
   c. Update Product.currentStock ($inc receivedQty)
```

---

## Relations Models

```
Supplier 1:N Product (via supplierId)
Product  1:N InventoryEntryItem (via productId)
Product  1:N StockMovement (via productId)
Product  1:N PurchaseOrderItem (via productId)

InventoryEntry 1:N InventoryEntryItem (embedded)
PurchaseOrder  1:N PurchaseOrderItem (embedded)

StockMovement -> reference (orderNumber ou entryId)

Task.metadata.type = "inventory" -> InventoryEntry (via entry.taskId)
RecurringTask.metadata.type = "inventory" -> Templates inventaire
```

---

## Permissions

| Action | Staff | Admin | Dev |
|--------|-------|-------|-----|
| View suppliers/products | Yes | Yes | Yes |
| Create/edit suppliers | No | Yes | Yes |
| View/create entries | Yes | Yes | Yes |
| Finalize entries | Yes | Yes | Yes |
| View/create orders | Yes | Yes | Yes |
| Validate/send orders | No | Yes | Yes |
| Receive orders | Yes | Yes | Yes |
| View analytics | No | Yes | Yes |

Gere via `getRequiredRoles()` dans `lib/inventory/permissions.ts`.

---

## Indexes DB

| Model | Index | Type |
|-------|-------|------|
| Supplier | `{ name: 1 }` | Unique |
| Product | `{ supplierId: 1 }` | Regular |
| Product | `{ category: 1, isActive: 1 }` | Compound |
| InventoryEntry | `{ date: -1 }` | Sort |
| StockMovement | `{ productId: 1, date: -1 }` | Compound |
| PurchaseOrder | `{ orderNumber: 1 }` | Unique |
| PurchaseOrder | `{ supplierId: 1 }` | Regular |
| PurchaseOrder | `{ status: 1 }` | Regular |
| Task (metadata) | `{ 'metadata.type': 1, status: 1 }` | Compound |
