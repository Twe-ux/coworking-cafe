# CLAUDE.md - CoworKing Café Monorepo

Instructions pour Claude Code lors du travail sur ce projet.

## 📋 Contexte du projet

Monorepo Next.js 14 contenant deux applications principales :

- **apps/site** : Site public + Dashboard client (Bootstrap + SCSS)
- **apps/admin** : Dashboard admin (Tailwind + shadcn/ui + PWA)
- **packages/** : Code partagé (database, email, shared)

**Répertoire du projet** : `/Users/twe/Developer/Thierry/coworking-cafe/`

---

## 🎯 Objectifs du Projet

### apps/site - En Refactorisation 🚧

**Objectif** : Refactorisation complète du code migré pour respecter les standards de qualité

- 🎯 Zéro `any` types
- 🎯 Fichiers < 200 lignes
- 🎯 Nommage BEM cohérent pour SCSS
- 🎯 Composants réutilisables avec children
- 🎯 Pas de duplication de code
- 🎯 Dates en format string (YYYY-MM-DD, HH:mm)

**Voir** : `/apps/site/CLAUDE.md` pour les détails

### apps/admin - Production Ready ✅

**Status** : Code propre et maintenable après refactoring complet

- ✅ Sécurité : 100% des routes protégées
- ✅ Types : 0 `any` types
- ✅ Architecture : APIs consolidées, fichiers modulaires
- ✅ Build réussi

**Voir** : `/apps/admin/CLAUDE.md` pour les détails

---

## 📚 Documentation par App

**IMPORTANT : Consulter le CLAUDE.md spécifique à l'app sur laquelle tu travailles**

### Pour travailler sur le Site Public / Dashboard Client
→ **Lire** : `/apps/site/CLAUDE.md`
- Stack : Bootstrap + SCSS
- Architecture site public + dashboard
- Conventions BEM modifiées
- Workflow de refactorisation

### Pour travailler sur le Dashboard Admin
→ **Lire** : `/apps/admin/CLAUDE.md`
- Stack : Tailwind + shadcn/ui
- Architecture HR + Comptabilité
- Patterns de sécurité
- Workflow de migration

### Documentation Générale (si existante)
- `docs/CONVENTIONS.md` - Conventions générales du monorepo
- `docs/REFACTO_TEMPLATE.md` - Template de refactorisation

---

## 🔧 Commandes

```bash
# Root
pnpm install              # Installer toutes les dépendances
pnpm dev                  # Lancer site + admin en parallèle
pnpm build                # Builder toutes les apps

# Site (Bootstrap + SCSS)
pnpm --filter @coworking-cafe/site dev
pnpm --filter @coworking-cafe/site build
pnpm --filter @coworking-cafe/site type-check

# Admin (Tailwind + shadcn/ui)
pnpm --filter @coworking-cafe/admin dev
pnpm --filter @coworking-cafe/admin build
pnpm --filter @coworking-cafe/admin type-check
```

---

## ✅ Conventions Communes au Monorepo

**Ces règles s'appliquent à TOUTES les apps du monorepo (site + admin)**

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) { }

// ✅ CORRECT
interface UserData {
  id: string
  name: string
}
function handleData(data: UserData) { }
```

**Règles** :
- ✅ Toujours typer paramètres et retours de fonction
- ✅ Utiliser les types partagés des dossiers `/types/`
- ✅ Interfaces pour objets, types pour unions
- ❌ Jamais `as any` sans justification documentée
- ❌ Jamais `@ts-ignore` ou `@ts-expect-error`

### 2. Formats de Dates - TOUJOURS des Strings

```typescript
// ❌ INTERDIT - Timestamps ISO
{
  date: new Date("2026-01-16T00:00:00.000Z")  // Bugs timezone
}

// ✅ CORRECT - Strings simples
{
  date: "2026-01-16",    // YYYY-MM-DD
  time: "09:00"          // HH:mm
}
```

### 3. Taille des Fichiers

| Type | Max lignes | Si dépassé |
|------|------------|------------|
| Composants React | 200 | Extraire sous-composants |
| Custom Hooks | 150 | Séparer en hooks spécialisés |
| Pages Next.js | 150 | Logique → hooks, UI → composants |
| API Routes | 200 | Extraire validation/logique |

### 4. Composants Réutilisables

```tsx
// ❌ MAUVAIS - Duplication
<HeroOne />
<HeroTwo />

// ✅ BON - Composant flexible avec children
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>
```

### 5. Nommage des Fichiers

- **Composants** : `PascalCase.tsx` (BookingCard.tsx)
- **Hooks** : `camelCase.ts` (useBookings.ts)
- **Utils** : `kebab-case.ts` (format-date.ts)
- **Types** : `camelCase.ts` (booking.ts)
- **API routes** : `route.ts` (convention Next.js)

---

## 📊 État d'avancement

### ✅ apps/admin - Production Ready

- [x] Structure complète (HR, Pointage, Comptabilité)
- [x] Sécurité : 100% routes protégées avec `requireAuth()`
- [x] Types : 0 `any` types
- [x] Architecture : Fichiers < 200 lignes, models modulaires
- [x] Build : Réussi (27/27 pages)
- [x] Documentation : `/apps/admin/CLAUDE.md` complet

### 🚧 apps/site - En Refactorisation

- [x] Code migré depuis l'ancien projet
- [x] Structure monorepo créée
- [ ] **En cours** : Refactorisation pour respecter conventions
  - [ ] Éliminer les `any` types
  - [ ] Découper fichiers > 200 lignes
  - [ ] Harmoniser nommage SCSS (BEM)
  - [ ] Créer composants réutilisables
  - [ ] Normaliser formats de dates (strings)

### 📋 Packages Partagés

- [x] `@coworking-cafe/database` - Connexion MongoDB + models Mongoose
- [x] `@coworking-cafe/email` - Templates emails
- [x] `@coworking-cafe/shared` - Utilitaires communs
- [ ] Documentation packages à créer

---

## 🚨 Rappels Importants

1. **Lire le CLAUDE.md de l'app** avant de coder (`/apps/site/` ou `/apps/admin/`)
2. **Respecter les conventions strictes** :
   - ZÉRO `any` types
   - Fichiers < 200 lignes
   - Dates en format string (YYYY-MM-DD, HH:mm)
   - Composants réutilisables avec children
3. **Valider avec l'utilisateur** avant changements majeurs
4. **Commits fréquents** avec messages descriptifs
5. **Tests avant commit** :
   ```bash
   pnpm type-check  # Vérifier TypeScript
   pnpm build       # Vérifier build
   ```

---

## 💡 Workflow Recommandé

### Travailler sur apps/site

1. Lire `/apps/site/CLAUDE.md`
2. Suivre le workflow de refactorisation (4 phases)
3. Vérifier que le code respecte les conventions
4. Tester responsive + build
5. Commit

### Travailler sur apps/admin

1. Lire `/apps/admin/CLAUDE.md`
2. Utiliser les helpers existants (`/lib/api/`)
3. Utiliser les types partagés (`/types/`)
4. Protéger toutes les routes avec `requireAuth()`
5. Tester + build + commit

### Migrer un Module de Site vers Admin

1. Analyser le module dans `/apps/site/`
2. Suivre le workflow dans `/apps/admin/CLAUDE.md` section "Migration"
3. Créer types → models → APIs → composants
4. Respecter l'architecture modulaire
5. Tester + documenter

---

## ⏰ Tâches Planifiées (Cron Jobs via N8N)

**IMPORTANT** : Les tâches planifiées sont gérées via **N8N** (pas de cron Northflank)

### Documentation

→ **Lire** : `/docs/n8n/README.md`

### Liste des Cron Jobs Actifs

| Job | Schedule | Endpoint | Description |
|-----|----------|----------|-------------|
| Send Reminders | 10:00 | `/api/cron/send-reminders` | Rappels 24h avant |
| Check Attendance | 10:00 | `/api/cron/check-attendance` | No-shows J-1 |
| Daily Report | 19:00 | `/api/cron/daily-report` | Rapport admin |

> **Note** : Jobs obsolètes : `create-holds`, `capture-deposits` (Stripe 90j), `publish-scheduled` (blog supprimé)

### Ajouter un nouveau Cron Job

1. **Créer l'endpoint** dans `apps/site/src/app/api/cron/[nom]/route.ts`
2. **Sécuriser** avec `CRON_SECRET` header
3. **Documenter** dans `/docs/n8n/README.md`
4. **Créer le workflow N8N** (utiliser le template)
5. **Tester** manuellement avant activation

---

## 🔗 Liens Rapides

- **Projet** : `/Users/twe/Developer/Thierry/coworking-cafe/`
- **Documentation site** : `/apps/site/CLAUDE.md`
- **Documentation admin** : `/apps/admin/CLAUDE.md`
- **Documentation N8N** : `/docs/n8n/README.md`
- **Conventions générales** : Ce fichier + `/docs/` (si existe)

---

_Dernière mise à jour : 2026-01-26_
