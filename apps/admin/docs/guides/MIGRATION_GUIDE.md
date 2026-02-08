# Guide de Migration depuis /apps/site

Guide complet pour migrer des modules de `/apps/site/` vers `/apps/admin/`.

## ⚠️ PHILOSOPHIE : Réécriture, pas Copier-Coller

**Ce n'est PAS un copier-coller !**

```
❌ MAUVAISE APPROCHE          ✅ BONNE APPROCHE
────────────────────────      ────────────────────────
1. Copier le code             1. ANALYSER le code source
2. Coller dans admin          2. COMPRENDRE la logique métier
3. Ajuster les imports        3. IDENTIFIER les problèmes
                              4. RÉÉCRIRE proprement
                              5. RESPECTER les conventions
```

### Pourquoi Réécrire ?

- 🎯 Éliminer les `any` types
- 🎯 Découper fichiers > 200 lignes
- 🎯 Structure modulaire (models, types, helpers)
- 🎯 Patterns de sécurité (`requireAuth()`)
- 🎯 Normaliser formats dates (strings)
- 🎯 Utiliser Tailwind + shadcn/ui

---

## 🔄 Workflow de Migration (Étape par Étape)

### 1. Analyse (30 min)

```bash
# Liste les fichiers du module
ls -la /apps/site/src/app/dashboard/booking/

# Analyse :
# - Quelles pages ?
# - Quels composants ?
# - Quelles APIs ?
# - Quels types ?
# - Quelles dépendances ?
```

**Documenter dans un fichier temporaire** :

```markdown
## Module: Booking

### Structure actuelle
- Pages: calendar, reservations, settings
- Composants: 12 composants
- APIs: /api/bookings (GET, POST, PUT, DELETE)
- Types: booking.ts, reservation.ts
- Hooks: useBookings.ts, useCalendar.ts

### Stack technique
- FullCalendar pour calendrier
- Recharts pour graphiques

### Dépendances
- Employee (✅ déjà dans admin)
- Space (❌ à créer)
- Tariff (❌ à créer)
```

### 2. Types d'abord (1h)

```typescript
// 1. Créer /types/booking.ts dans /apps/admin/
export interface Booking {
  id: string
  clientId: string
  spaceId: string
  startDate: string  // YYYY-MM-DD
  endDate: string
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled'
}

// 2. Réutiliser types existants
import type { Employee } from '@/types/hr'

export interface BookingWithEmployee extends Booking {
  employee: Pick<Employee, 'id' | 'firstName' | 'lastName'>
}
```

### 3. Models Mongoose (1-2h)

```bash
# Créer structure modulaire
mkdir -p src/models/booking
touch src/models/booking/{index,document,methods,hooks}.ts

# Suivre le pattern établi (voir /models/employee/)
```

### 4. API Routes (2-3h)

```bash
# Créer la structure
mkdir -p src/app/api/booking
touch src/app/api/booking/route.ts
touch src/app/api/booking/[id]/route.ts
```

**Suivre le pattern établi** (voir [API_GUIDE.md](./API_GUIDE.md))

### 5. Composants (3-4h)

```bash
# Créer la structure
mkdir -p src/components/booking
touch src/components/booking/{BookingCalendar,BookingList,BookingModal}.tsx
```

**Adapter le code** :
- Remplacer `any` par types propres
- Extraire hooks si > 100 lignes
- Utiliser shadcn/ui
- Limite 200 lignes/fichier

### 6. Hooks (1h)

```typescript
// hooks/useBookings.ts
export function useBookings(filters?: BookingFilters) {
  // Pattern établi (voir useEmployees.ts)
  return { bookings, loading, error, refetch }
}
```

### 7. Pages (2h)

```bash
# Créer les pages
mkdir -p src/app/(dashboard)/(admin)/booking
touch src/app/(dashboard)/(admin)/booking/page.tsx
```

### 8. Sidebar (30 min)

```typescript
// src/components/layout/app-sidebar.tsx
const navItems = [
  // ... existing items
  {
    title: "Réservations",
    icon: Calendar,
    items: [
      { title: "Calendrier", url: "/booking/calendar" },
      { title: "Liste", url: "/booking/list" },
    ],
  },
]
```

---

## 🔄 APIs Partagées (Site Public + Admin)

### Comprendre la Structure de `/apps/site/`

`/apps/site/` contient **DEUX parties distinctes** :

```
/apps/site/
├── src/app/(site)/              # 🌐 SITE PUBLIC
│   ├── page.tsx
│   ├── booking/
│   └── blog/
│
└── src/app/dashboard/           # 👤 DASHBOARD CLIENT (à migrer)
    ├── (admin)/
    ├── settings/
    └── promo/
```

### Catégories d'APIs

- ✅ **Partagées** : Site public ET dashboard
- 🔵 **Dashboard only** : Dashboard uniquement (à migrer)
- 🟢 **Site only** : Site public uniquement (garder)

### Stratégies pour APIs Partagées

#### Option A : Package Database (préféré)

```typescript
// packages/database/src/models/booking/
import { Booking } from '@coworking-cafe/database'
```

#### Option B : Compatibilité (maintenir les deux)

```typescript
// Même structure dans les deux apps
// apps/site/src/app/api/booking/route.ts
// apps/admin/src/app/api/booking/route.ts

interface BookingResponse {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  // ... même structure
}
```

### Workflow APIs Partagées

```bash
# 1. Identifier les APIs utilisées
grep -r "fetch('/api" apps/site/src/app/dashboard/promo/
grep -r "fetch('/api" apps/site/src/app/(site)/

# 2. Classifier
# /api/promo/current → Site + Dashboard → Partagée
# /api/promo/admin → Dashboard only → À migrer

# 3. Décider stratégie (packages/database ou compatibilité)

# 4. Migrer

# 5. Vérifier que tout compile
cd apps/site && pnpm type-check
cd apps/admin && pnpm type-check
```

---

## 🔧 Renommage de Models

**⚠️ CRITIQUE** : Mettre à jour **TOUTES** les références dans `apps/site`.

### Checklist Renommage

```bash
# Exemple : PromoToken → PromoConfig

# 1. Identifier TOUS les fichiers
grep -r "PromoToken" apps/site/src/

# 2. Mettre à jour CHAQUE fichier
# - /types/promo.ts
# - /app/api/promo/route.ts
# - /app/dashboard/promo/page.tsx
# - /components/promo/PromoCard.tsx
# - /hooks/usePromo.ts
# - /lib/promo-utils.ts

# 3. Vérifier compilation
cd apps/site && pnpm type-check

# 4. Tester visuellement
pnpm dev
```

---

## 💾 Préservation Structure Models

**⚠️ IMPORTANT** : Préserver pour import données MongoDB d'origine.

```typescript
// ✅ BON - Structure préservée
interface PromoConfig {
  id: string
  token: string           // ✅ Même nom
  discountPercent: number // ✅ Même nom
  expiresAt: Date | string // ✅ Même nom

  // Nouveaux champs optionnels OK
  description?: string
  maxUses?: number
}

// ❌ MAUVAIS - Structure changée
interface PromoConfig {
  id: string
  promoCode: string  // ❌ Renommé → casse import
  discount: {        // ❌ Structure changée → casse import
    type: 'percent'
    value: number
  }
}
```

---

## 🎨 Nettoyage Assets (SCSS, Images, Fonts)

**⚠️ IMPORTANT** : Vérifier `apps/site/src/assets/site/` après migration.

### Workflow

```bash
# 1. Chercher assets du module
find apps/site/src/assets/site -name "*promo*"

# 2. Pour chaque asset trouvé
grep -r "card-promo" apps/site/src/app/\(site\)/

# 3. Décision
# → Utilisé par site public ? CONSERVER ✅
# → Uniquement dashboard ? SUPPRIMER ❌
```

---

## ✅ Checklist Migration Complète

### Avant Migration

- [ ] Module analysé (pages, composants, APIs, types)
- [ ] APIs classifiées (partagée / dashboard / site)
- [ ] Structure model documentée
- [ ] Dépendances identifiées

### Pendant Migration

- [ ] Types créés dans `/types/`
- [ ] Models Mongoose (structure modulaire)
- [ ] API routes avec auth
- [ ] Composants < 200 lignes
- [ ] Hooks custom
- [ ] Pages < 150 lignes
- [ ] Zero `any` types
- [ ] Dates en format string
- [ ] Assets vérifiés

### Après Migration

- [ ] `pnpm type-check` apps/site OK
- [ ] `pnpm type-check` apps/admin OK
- [ ] Tests visuels site public
- [ ] Tests visuels admin
- [ ] `pnpm build` réussi
- [ ] Documentation mise à jour
- [ ] Commit descriptif

---

**Temps estimé par module** : 1-2 jours

---

**Voir aussi** :
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Structure des dossiers
- [CONVENTIONS.md](./CONVENTIONS.md) - Règles de code
- [API_GUIDE.md](./API_GUIDE.md) - Patterns API
