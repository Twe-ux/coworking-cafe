# 🚀 Système de Cache - Site App

## 📋 Vue d'ensemble

Ce document explique le système de cache implémenté pour réduire drastiquement les appels MongoDB.

### Problème résolu

**Avant** : Chaque visite sur `/boissons`, `/horaires`, etc. faisait une requête MongoDB
- Menu: ~100 requêtes/min
- Horaires: ~50 requêtes/min
- **Total**: ~150+ requêtes MongoDB/min

**Après** : Cache de 24h pour les données qui changent rarement
- Menu: 1 requête toutes les 24h
- Horaires: 1 requête toutes les 24h
- **Total**: ~2 requêtes MongoDB/jour

**Réduction**: **99.9% de requêtes en moins** 🎉

---

## 🛠️ Helpers de Cache

### Fichier: `/lib/cache-helpers.ts`

Trois fonctions de cache selon la fréquence de modification :

#### 1. `cache24h()` - Données rarement modifiées
```typescript
import { cache24h } from '@/lib/cache-helpers';

const getCachedMenu = cache24h(
  async () => {
    // Requête MongoDB
    const menu = await MenuItem.find({ isActive: true });
    return menu;
  },
  ['menu', 'drink'], // Clé unique
  { tags: ['menu', 'menu-drink'] } // Tags pour invalidation
);

const menu = await getCachedMenu();
```

**Utilisé pour**:
- Menu boissons/food (`/api/drinks`)
- Horaires d'ouverture (`/api/global-hours`)
- Espaces coworking
- Services additionnels

**Durée**: 24 heures (86400 secondes)

---

#### 2. `cache1h()` - Données modérément modifiées
```typescript
import { cache1h } from '@/lib/cache-helpers';

const getCachedArticles = cache1h(
  async () => {
    const articles = await Article.find({ status: 'published' });
    return articles;
  },
  ['articles', 'published'],
  { tags: ['articles'] }
);
```

**Utilisé pour**:
- Articles de blog
- Catégories

**Durée**: 1 heure (3600 secondes)

---

#### 3. `cache5min()` - Données fréquemment modifiées
```typescript
import { cache5min } from '@/lib/cache-helpers';

const getCachedAvailability = cache5min(
  async () => {
    const availability = await Booking.find({ status: 'confirmed' });
    return availability;
  },
  ['availability', date],
  { tags: ['bookings'] }
);
```

**Utilisé pour**:
- Disponibilités
- Statistiques en temps quasi-réel

**Durée**: 5 minutes (300 secondes)

---

## 🏷️ Tags de Cache

### Fichier: `/lib/cache-helpers.ts`

Les tags permettent d'invalider des groupes de cache :

```typescript
export const CACHE_TAGS = {
  MENU: 'menu',
  MENU_DRINK: 'menu-drink',
  MENU_FOOD: 'menu-food',
  GLOBAL_HOURS: 'global-hours',
  SPACES: 'spaces',
  ADDITIONAL_SERVICES: 'additional-services',
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
} as const;
```

---

## ♻️ Invalidation du Cache

### Automatique (Time-based)

Le cache expire automatiquement après la durée configurée :
- `cache24h()` → 24 heures
- `cache1h()` → 1 heure
- `cache5min()` → 5 minutes

### Manuelle (Tag-based)

Quand les données sont modifiées dans l'admin, on peut invalider le cache immédiatement.

#### Option 1: Depuis le code
```typescript
import { invalidateCache, CACHE_TAGS } from '@/lib/cache-helpers';

// Après modification du menu dans l'admin
await MenuItem.create({ name: 'Nouveau café' });
invalidateCache(CACHE_TAGS.MENU); // ✅ Cache invalidé immédiatement
```

#### Option 2: Via API
```bash
# Depuis apps/admin ou Postman
curl -X POST http://localhost:3000/api/cache/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag":"menu"}'
```

**Réponse**:
```json
{
  "success": true,
  "message": "Cache invalidé pour le tag: menu",
  "timestamp": "2026-01-24T18:30:00.000Z"
}
```

---

## 📊 Routes Cachées

### ✅ Actuellement cachées (24h)

| Route | Tag | Durée | Raison |
|-------|-----|-------|--------|
| `GET /api/drinks` | `menu`, `menu-drink` | 24h | Menu change rarement |
| `GET /api/global-hours` | `global-hours` | 24h | Horaires changent rarement |

### 🔜 À cacher prochainement

| Route | Tag suggéré | Durée suggérée |
|-------|-------------|----------------|
| `GET /api/spaces` | `spaces` | 24h |
| `GET /api/additional-services` | `additional-services` | 24h |
| `GET /api/articles` | `articles` | 1h |
| `GET /api/categories` | `categories` | 24h |

---

## 🔍 Monitoring

### Vérifier si le cache fonctionne

1. **Première requête** (cache miss):
```bash
curl http://localhost:3000/api/drinks?type=drink
# MongoDB query exécutée
```

2. **Deuxième requête** (cache hit):
```bash
curl http://localhost:3000/api/drinks?type=drink
# MongoDB query NON exécutée (cache utilisé)
```

### Logs MongoDB

Avant cache:
```
✓ MongoDB connected successfully (×100 fois/min)
```

Après cache:
```
✓ MongoDB connected successfully (×1 fois/jour)
```

---

## ⚠️ Important

### Quand NE PAS cacher

- Routes d'authentification (`/api/auth/*`)
- Webhooks Stripe (`/api/payments/webhook`)
- Routes de création/modification (POST/PUT/DELETE)
- Données en temps réel (chats, notifications)
- Routes avec authentification utilisateur spécifique

### Bonnes pratiques

1. **Toujours utiliser des tags** pour pouvoir invalider le cache
2. **Clés uniques** : Inclure les paramètres dans la clé (`['menu', type]`)
3. **Durée adaptée** : 24h pour données statiques, 5min pour données dynamiques
4. **Invalider après modification** : Appeler `invalidateCache()` après PUT/POST/DELETE

---

## 🚀 Bénéfices

### Performance
- ⚡ Réponse instantanée (pas d'attente MongoDB)
- 🚀 Site plus rapide pour les utilisateurs
- 💾 Moins de charge serveur

### Coûts
- 💰 Réduction des coûts MongoDB (moins de requêtes = moins cher)
- ☁️ Moins de bande passante réseau

### Scalabilité
- 📈 Support de plus de trafic avec la même infrastructure
- 🌍 Meilleure expérience utilisateur globale

---

## 📝 Exemples Complets

### Exemple 1: Route avec cache

```typescript
// apps/site/src/app/api/drinks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuItem, MenuCategory } from '@coworking-cafe/database';
import { cache24h } from '../../../lib/cache-helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'drink';

  const getCachedMenu = cache24h(
    async () => {
      const categories = await MenuCategory.find({ type, isActive: true });
      const items = await MenuItem.find({ type, isActive: true });
      return { categories, items };
    },
    ['menu', type],
    { tags: ['menu', `menu-${type}`] }
  );

  const { categories, items } = await getCachedMenu();
  return NextResponse.json({ categories, items });
}
```

### Exemple 2: Invalidation après modification

```typescript
// apps/admin/src/app/api/menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MenuItem } from '@coworking-cafe/database';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Créer le nouvel item
  const item = await MenuItem.create(body);

  // Invalider le cache du site
  await fetch('http://localhost:3000/api/cache/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag: 'menu' })
  });

  return NextResponse.json(item);
}
```

---

**Dernière mise à jour**: 2026-01-24
**Version**: 1.0
