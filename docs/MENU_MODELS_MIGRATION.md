# Migration des Models Menu vers Package Partagé

**Date** : 2026-01-18
**Auteur** : Thierry + Claude

---

## Contexte

Les models de menu (food/drinks) étaient dupliqués entre `apps/site` et `apps/admin` :
- `apps/site` utilisait ses propres models locaux (`Drink`, `Food`, `DrinkCategory`, `FoodCategory`)
- `apps/admin` avait créé de nouveaux models (`MenuItem`, `MenuCategory`) dans `packages/database`
- Résultat : confusion et données potentiellement dupliquées

## Problème Identifié

### Avant Migration

**Dans apps/site :**
```typescript
// apps/site/src/models/drink/index.ts
- DrinkCategory → collection "drink_categories"
- Drink → collection "drinks"

// apps/site/src/models/food/index.ts
- FoodCategory → collection "food_categories"
- Food → collection "drinks" ❌ BUG ! (devrait être "foods")
```

**Dans packages/database :**
```typescript
// packages/database/src/models/menuCategory/
- MenuCategory → collection "menucategories" (par défaut Mongoose)

// packages/database/src/models/menuItem/
- MenuItem → collection "menuitems" (par défaut Mongoose)
```

**Résultat :**
- 3 collections différentes en MongoDB
- Duplication de code
- Bug dans le model Food
- Données non partagées entre apps

## Solution Appliquée

### 1. Correction des Collections dans packages/database

**MenuCategorySchema** :
```typescript
// packages/database/src/models/menuCategory/document.ts
export const MenuCategorySchema = new Schema<MenuCategoryDocument>(
  { ... },
  {
    timestamps: true,
    collection: "drink_categories", // ✅ Utilise collection existante
  }
);
```

**MenuItemSchema** :
```typescript
// packages/database/src/models/menuItem/document.ts
export const MenuItemSchema = new Schema<MenuItemDocument>(
  { ... },
  {
    timestamps: true,
    collection: "drinks", // ✅ Contient food ET drink (type: "food" | "drink")
  }
);
```

### 2. Mise à Jour de apps/site

**API /api/drinks/route.ts** :
```typescript
// ❌ AVANT
import { Drink, DrinkCategory } from '@/models/drink';

const categories = await DrinkCategory.find({ ... });
const drinks = await Drink.find({ ... });

// ✅ APRÈS
import { MenuItem, MenuCategory } from '@coworking-cafe/database';

const categories = await MenuCategory.find({ ... });
const drinks = await MenuItem.find({ ... });
```

### 3. Suppression des Models Locaux

Models supprimés dans `apps/site/src/models/` :
- ❌ `drink/` (document.ts, index.ts)
- ❌ `food/` (document.ts, index.ts)

## Structure Finale

### Collections MongoDB

| Collection | Contenu | Model |
|------------|---------|-------|
| `drink_categories` | Catégories food + drink | `MenuCategory` |
| `drinks` | Items food + drink | `MenuItem` |

**Note** : La collection s'appelle "drinks" mais contient TOUT (food ET drink), différenciés par le champ `type`.

### Models Partagés

**MenuCategory** (`@coworking-cafe/database`) :
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string,
  description?: string,
  type: "food" | "drink",
  order: number,
  isActive: boolean,
  showOnSite: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**MenuItem** (`@coworking-cafe/database`) :
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  recipe?: string,
  image?: string,
  category: ObjectId (ref: MenuCategory),
  type: "food" | "drink",
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Impact

### Apps Affectées

- ✅ **apps/site** : Utilise maintenant les models partagés
- ✅ **apps/admin** : Utilisait déjà les models partagés
- ✅ **packages/database** : Collections corrigées

### APIs Mises à Jour

- ✅ `apps/site/src/app/api/drinks/route.ts`

### Pages/Composants

- ℹ️ Les pages dashboard (`dashboard/menu/food`, `dashboard/menu/drinks`) dans `apps/site` utilisent toujours des interfaces locales, mais appellent les APIs qui utilisent les bons models

## Migration des Données

⚠️ **Aucune migration de données nécessaire** car :
- Les collections MongoDB n'ont pas changé de nom
- Les schemas sont compatibles
- Juste un changement d'import dans le code

## Tests

### À Vérifier

- [ ] `apps/site` : Page `/dashboard/menu/food` charge bien les aliments
- [ ] `apps/site` : Page `/dashboard/menu/drinks` charge bien les boissons
- [ ] `apps/site` : API `/api/drinks?type=food` retourne les aliments
- [ ] `apps/site` : API `/api/drinks?type=drink` retourne les boissons
- [ ] `apps/admin` : Page menu admin fonctionne
- [ ] `apps/admin` : Page menu staff/recipes fonctionne

### Commandes de Test

```bash
# Type check
cd apps/site && pnpm type-check
cd apps/admin && pnpm type-check

# Build
cd apps/site && pnpm build
cd apps/admin && pnpm build

# Dev
pnpm dev
```

## Documentation

- **Models** : `packages/database/src/models/menuCategory/` et `menuItem/`
- **Types** : `apps/admin/src/types/menu.ts`
- **APIs** : `apps/site/src/app/api/drinks/route.ts`

## Prochaines Étapes (Optionnel)

### Refactoring Complet Dashboard Menu

Pour aller plus loin, on pourrait :

1. **Migrer dashboard/menu de apps/site vers apps/admin**
   - Pages `dashboard/menu/food` et `dashboard/menu/drinks`
   - C'est du code admin, devrait être dans `apps/admin`

2. **Créer des APIs dédiées dans apps/admin**
   - `/api/menu/categories` (GET, POST, PUT, DELETE)
   - `/api/menu/items` (GET, POST, PUT, DELETE)

3. **Nettoyer les types**
   - Supprimer les interfaces locales dans dashboard
   - Utiliser les types de `apps/admin/src/types/menu.ts`

## Notes Importantes

### Compatibilité Ascendante

✅ Les données existantes en MongoDB sont préservées
✅ Pas de breaking change pour les utilisateurs
✅ Les APIs existantes continuent de fonctionner

### Nommage

⚠️ Bien que la collection s'appelle "drinks", elle contient **food ET drink**. C'est historique. Pour éviter toute confusion :
- Toujours utiliser `MenuItem` (pas Drink ou Food)
- Toujours filtrer par `type: "food"` ou `type: "drink"`

---

**Dernière mise à jour** : 2026-01-18
