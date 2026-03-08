# FAQ - Module Inventory

## Questions Frequentes

### Q: Pourquoi currentStock n'est pas editable manuellement ?
**R:** Pour garantir la tracabilite. Toutes les modifications de stock passent par des StockMovements (inventaire ou reception commande). Cela permet d'avoir un historique complet des variations.

### Q: Difference entre inventaire hebdomadaire et mensuel ?
**R:**
- **Hebdomadaire** : Uniquement produits a DLC courte (lait, oeufs) - chaque lundi
- **Mensuel** : Tous produits actifs - 1er du mois

### Q: Comment fonctionnent les suggestions de commande ?
**R:** `GET /suggestions?supplierId=xxx` retourne tous les produits du fournisseur ou `currentStock < minStock`. La quantite suggeree = `maxStock - currentStock` pour ramener au stock maximum.

### Q: Que se passe-t-il si je recois moins que commande ?
**R:** Lors de la reception (`POST /receive`), vous saisissez les quantites reellement recues. Les StockMovements et currentStock sont mis a jour avec ces quantites, pas celles commandees.

### Q: Comment interpreter le taux de rotation ?
**R:**
- **< 3** : Sur-stockage (capital immobilise)
- **3-6** : Optimal pour alimentaire
- **> 6** : Sous-stockage (risque rupture)

### Q: Pourquoi metadata au lieu de prefixe `[Inventaire]` dans les taches ?
**R:** Migration vers approche typesafe et performante. `metadata.type: "inventory"` permet un filtrage DB indexe (`{ 'metadata.type': 1, status: 1 }`) au lieu de regex, et est extensible pour d'autres types de taches.

### Q: Comment ajouter un nouveau type de tache inventaire ?
**R:** Ajouter une nouvelle valeur a `metadata.inventoryType` dans `POST /tasks/setup`. Les types existants sont `weekly` et `monthly`.

---

## Troubleshooting

### Stock negatif apres inventaire
**Cause** : Ecart negatif important (actualQuantity tres inferieur a theoreticalQuantity).
**Solution** : Verifier la saisie, re-compter si necessaire. Si correct, accepter l'ecart (perte, vol, casse).

### Tache inventaire ne s'auto-cree pas
**Cause** : Templates RecurringTask pas crees ou sync pas execute.
**Solution** :
1. `POST /api/inventory/tasks/setup` (creer templates)
2. `POST /api/tasks/recurring/sync` (sync manuel si cron pas configure)

### Email commande pas envoye
**Cause** : Service email pas configure (placeholder actuellement - `console.log`).
**Solution** : Implementer `sendPurchaseOrderEmail()` dans un futur module email avec vraie integration.

### Erreur "Produit introuvable" lors d'une commande
**Cause** : Produit desactive ou supprime entre la creation du brouillon et la validation.
**Solution** : Verifier que les produits sont toujours actifs avant validation.

### Build Vercel echoue sur module inventory
**Cause probable** : Voir les patterns documentes dans `/memory/MEMORY.md` :
- Index Mongoose dupliques (unique + Schema.index)
- Service init au niveau module (lazy init pattern)
**Solution** : Verifier les modeles inventory suivent le pattern standard.

---

## Patterns Techniques

### Auth obligatoire sur chaque route
```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(getRequiredRoles('viewProducts'))
  if (!authResult.authorized) return authResult.response
  // ...
}
```

### Transform pour API responses
```typescript
// Toujours transformer avant de renvoyer
const transformed = transformProductForAPI(product)
return successResponse(transformed)
```

### Dates en format string
```typescript
// DB stocke Date, API retourne string YYYY-MM-DD
createdAt: doc.createdAt?.toISOString().split('T')[0] || ''
```

### Model registration (dev hot-reload)
```typescript
import mongoose from 'mongoose'
import { MySchema } from './document'

// Prevent model overwrite in dev (hot-reload)
delete mongoose.models.MyModel
export const MyModel = mongoose.model('MyModel', MySchema)
```
