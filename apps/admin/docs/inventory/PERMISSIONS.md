# Inventory Module - Permissions & Security

Documentation des permissions et de la sécurité du module de gestion de stock.

---

## 📊 Matrice de Permissions

### Vue d'Ensemble

| Action | Admin | Staff | Notes |
|--------|-------|-------|-------|
| **Fournisseurs** |
| Voir liste fournisseurs | ✅ | ✅ | Lecture seule pour staff |
| Créer fournisseur | ✅ | ❌ | Admin uniquement |
| Modifier fournisseur | ✅ | ❌ | Admin uniquement |
| Supprimer fournisseur | ✅ | ❌ | Admin uniquement |
| **Produits** |
| Voir liste produits | ✅ | ✅ | Lecture seule pour staff |
| Créer produit | ✅ | ❌ | Admin uniquement |
| Modifier produit | ✅ | ❌ | Admin uniquement |
| Supprimer produit | ✅ | ❌ | Admin uniquement |
| **Inventaires** |
| Voir historique inventaires | ✅ | ✅ | Tous |
| Saisir inventaire | ✅ | ✅ | Staff via tâches assignées |
| Finaliser inventaire | ✅ | ✅ | Tous |
| **Mouvements de Stock** |
| Voir mouvements | ✅ | ✅ | Tous |
| Créer mouvement manuel | ✅ | ✅ | Ajustements stock |
| **Commandes Fournisseurs** |
| Voir commandes | ✅ | ✅ | Tous |
| Créer brouillon | ✅ | ✅ | Tous peuvent préparer |
| Valider commande | ✅ | ❌ | Admin uniquement |
| Envoyer au fournisseur | ✅ | ❌ | Admin uniquement |
| Réceptionner stock | ✅ | ✅ | Tous |
| **Analytics** |
| Dashboard analytics | ✅ | ❌ | Admin uniquement |
| Rapports CA vs Stock | ✅ | ❌ | Admin uniquement |

---

## 🔑 Détail par Endpoint

### Fournisseurs (Suppliers)

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/suppliers` | GET | dev, admin, staff | Liste fournisseurs |
| `/api/inventory/suppliers` | POST | dev, admin | Créer fournisseur |
| `/api/inventory/suppliers/[id]` | GET | dev, admin, staff | Détail fournisseur |
| `/api/inventory/suppliers/[id]` | PUT | dev, admin | Modifier fournisseur |
| `/api/inventory/suppliers/[id]` | DELETE | dev, admin | Supprimer fournisseur |

### Produits (Products)

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/products` | GET | dev, admin, staff | Liste produits |
| `/api/inventory/products` | POST | dev, admin | Créer produit |
| `/api/inventory/products/[id]` | GET | dev, admin, staff | Détail produit |
| `/api/inventory/products/[id]` | PUT | dev, admin | Modifier produit |
| `/api/inventory/products/[id]` | DELETE | dev, admin | Supprimer produit |

### Inventaires (Inventory Entries)

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/entries` | GET | dev, admin, staff | Historique inventaires |
| `/api/inventory/entries` | POST | dev, admin, staff | Saisir inventaire |
| `/api/inventory/entries/[id]` | GET | dev, admin, staff | Détail inventaire |
| `/api/inventory/entries/[id]/finalize` | PUT | dev, admin, staff | Finaliser inventaire |

### Mouvements de Stock (Stock Movements)

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/movements` | GET | dev, admin, staff | Historique mouvements |
| `/api/inventory/movements` | POST | dev, admin, staff | Créer mouvement manuel |

### Commandes Fournisseurs (Purchase Orders)

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/purchase-orders` | GET | dev, admin, staff | Liste commandes |
| `/api/inventory/purchase-orders` | POST | dev, admin, staff | Créer brouillon |
| `/api/inventory/purchase-orders/[id]` | GET | dev, admin, staff | Détail commande |
| `/api/inventory/purchase-orders/[id]/validate` | PUT | dev, admin | Valider commande |
| `/api/inventory/purchase-orders/[id]/send` | PUT | dev, admin | Envoyer au fournisseur |
| `/api/inventory/purchase-orders/[id]/receive` | PUT | dev, admin, staff | Réceptionner stock |

### Analytics

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/inventory/analytics/overview` | GET | dev, admin | Vue d'ensemble |
| `/api/inventory/analytics/low-stock` | GET | dev, admin | Produits en rupture |
| `/api/inventory/analytics/turnover` | GET | dev, admin | Rotation stock |

---

## 🛠️ Helpers Backend

### Import

```typescript
import {
  canManageSuppliers,
  canManageProducts,
  canValidateOrders,
  canViewAnalytics,
  getRequiredRoles,
  hasPermission,
  isReadOnly,
} from '@/lib/inventory/permissions'
```

### Fonctions Disponibles

#### `canManageSuppliers(userRole: UserRole): boolean`

Vérifie si l'utilisateur peut créer/modifier/supprimer des fournisseurs.

```typescript
const userRole = session.user.role
if (!canManageSuppliers(userRole)) {
  return errorResponse('Permission refusée', 'Admin uniquement', 403)
}
```

#### `canManageProducts(userRole: UserRole): boolean`

Vérifie si l'utilisateur peut créer/modifier/supprimer des produits.

```typescript
if (!canManageProducts(userRole)) {
  return errorResponse('Permission refusée', 'Admin uniquement', 403)
}
```

#### `canValidateOrders(userRole: UserRole): boolean`

Vérifie si l'utilisateur peut valider et envoyer des commandes fournisseurs.

```typescript
if (!canValidateOrders(userRole)) {
  return errorResponse('Permission refusée', 'Admin uniquement', 403)
}
```

#### `canViewAnalytics(userRole: UserRole): boolean`

Vérifie si l'utilisateur peut accéder au dashboard analytics.

```typescript
if (!canViewAnalytics(userRole)) {
  return errorResponse('Permission refusée', 'Admin uniquement', 403)
}
```

#### `getRequiredRoles(permission: PermissionKey): readonly UserRole[]`

Récupère la liste des rôles autorisés pour une permission donnée.

```typescript
// Utilisation dans une route API
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
  if (!authResult.authorized) return authResult.response

  // Logique métier...
}
```

#### `isReadOnly(userRole: UserRole, resource: 'suppliers' | 'products'): boolean`

Détermine si l'utilisateur est en mode lecture seule pour une ressource.

```typescript
const isReadOnlyMode = isReadOnly(userRole, 'suppliers')
if (isReadOnlyMode) {
  return errorResponse('Mode lecture seule', 'Admin requis pour modifier', 403)
}
```

---

## 🎨 UI Conditionnelle (Frontend)

### Composant PermissionGuard

Utilisez `PermissionGuard` pour masquer/afficher des éléments UI selon les permissions :

```typescript
import { PermissionGuard } from '@/components/inventory/PermissionGuard'

// Masquer bouton "Modifier" si staff
<PermissionGuard require="manageSuppliers">
  <Button onClick={handleEdit}>Modifier Fournisseur</Button>
</PermissionGuard>

// Afficher Analytics seulement pour admin
<PermissionGuard
  require="viewAnalytics"
  fallback={<Alert>Accès réservé aux administrateurs</Alert>}
>
  <AnalyticsDashboard />
</PermissionGuard>
```

### Props PermissionGuard

| Prop | Type | Description |
|------|------|-------------|
| `children` | ReactNode | Contenu à afficher si autorisé |
| `require` | PermissionType | Permission requise |
| `fallback` | ReactNode (optionnel) | Contenu à afficher si refusé |

### Permissions Disponibles

- `manageSuppliers` - Créer/modifier fournisseurs (admin)
- `manageProducts` - Créer/modifier produits (admin)
- `validateOrders` - Valider commandes (admin)
- `viewAnalytics` - Voir analytics (admin)

---

## 🔒 Exemples API Routes

### Route Lecture (Tous les rôles)

```typescript
// GET /api/inventory/suppliers
import { requireAuth } from '@/lib/api/auth'
import { successResponse } from '@/lib/api/response'
import { Supplier } from '@/models/inventory/supplier'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response

  const suppliers = await Supplier.find({ isActive: true })
  return successResponse(suppliers)
}
```

### Route Écriture (Admin uniquement)

```typescript
// POST /api/inventory/suppliers
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getRequiredRoles } from '@/lib/inventory/permissions'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
  if (!authResult.authorized) return authResult.response

  const body = await request.json()
  // Validation et création...
  return successResponse(newSupplier, 201)
}
```

### Route Mixte (Validation conditionnelle)

```typescript
// PUT /api/inventory/purchase-orders/[id]/validate
import { requireAuth } from '@/lib/api/auth'
import { canValidateOrders } from '@/lib/inventory/permissions'
import { errorResponse } from '@/lib/api/response'

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response

  const userRole = authResult.session.user.role

  // Vérification permission spécifique
  if (!canValidateOrders(userRole)) {
    return errorResponse(
      'Permission refusée',
      'Seuls les admins peuvent valider',
      403
    )
  }

  // Logique validation...
}
```

---

## 🔐 Bonnes Pratiques

### 1. Toujours Vérifier en Backend

```typescript
// ❌ MAUVAIS - Sécurité uniquement côté UI
<PermissionGuard require="manageSuppliers">
  <Button onClick={callAPI}>Modifier</Button>
</PermissionGuard>

// ✅ BON - UI + API protégée
<PermissionGuard require="manageSuppliers">
  <Button onClick={callAPI}>Modifier</Button>
</PermissionGuard>

// Dans l'API
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(getRequiredRoles('manageSuppliers'))
  if (!authResult.authorized) return authResult.response
  // ...
}
```

### 2. Messages d'Erreur Explicites

```typescript
// ❌ MAUVAIS
return errorResponse('Erreur', 'Non autorisé', 403)

// ✅ BON
return errorResponse(
  'Permission refusée',
  'Seuls les administrateurs peuvent créer des fournisseurs',
  403
)
```

### 3. Logs Audit (Recommandé)

Pour les opérations critiques, logger l'action :

```typescript
console.log({
  action: 'VALIDATE_PURCHASE_ORDER',
  orderId: order._id,
  userId: session.user.id,
  userRole: session.user.role,
  timestamp: new Date().toISOString(),
})
```

### 4. Mode Read-Only Explicite

Indiquer visuellement le mode lecture seule :

```typescript
const readOnly = isReadOnly(userRole, 'suppliers')

return (
  <div>
    {readOnly && (
      <Alert variant="info">
        Mode lecture seule - Contactez un administrateur pour modifier
      </Alert>
    )}
    <SupplierForm disabled={readOnly} />
  </div>
)
```

---

## 📋 Checklist Sécurité

Avant de déployer une nouvelle route API :

- [ ] `requireAuth()` appelé en première ligne
- [ ] Rôles appropriés spécifiés (`getRequiredRoles()`)
- [ ] Validation des inputs côté serveur
- [ ] Messages d'erreur explicites (pas de secrets révélés)
- [ ] UI conditionnelle implémentée (`PermissionGuard`)
- [ ] Tests manuels avec rôle admin ET staff
- [ ] Logs audit pour opérations critiques

---

## 🔗 Voir Aussi

- [SECURITY.md](../guides/SECURITY.md) - Guide général sécurité
- [API_GUIDE.md](../guides/API_GUIDE.md) - Patterns API
- [permissions.ts](../../src/lib/inventory/permissions.ts) - Code source helpers

---

**Dernière mise à jour** : 2026-02-27
