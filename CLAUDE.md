# CLAUDE.md - CoworKing Café Monorepo

Instructions globales pour Claude Code sur ce projet.

---

## 📋 Vue d'Ensemble

Monorepo Next.js 14 avec **deux applications** :

| App | Description | Stack | Status |
|-----|-------------|-------|--------|
| **apps/site** | Site public + Dashboard client | Bootstrap + SCSS | 🚧 En refactorisation |
| **apps/admin** | Dashboard admin (HR, Compta, Pointage) | Tailwind + shadcn/ui | ✅ Production Ready |

**Packages partagés** :
- `@coworking-cafe/database` - MongoDB + Mongoose models
- `@coworking-cafe/email` - Templates emails
- `@coworking-cafe/shared` - Utilitaires communs

---

## 📚 Documentation par App

### 🌐 Site Public + Dashboard Client
→ **[apps/site/CLAUDE.md](./apps/site/CLAUDE.md)**

**Quand l'utiliser** :
- Travailler sur pages publiques (Home, Blog, Contact)
- Travailler sur Dashboard client (Réservations, Messages, Promo)
- Intégrer Stripe, Booking, Features site

**Stack** : Bootstrap 5, SCSS, BEM modifié

### 🏢 Dashboard Admin
→ **[apps/admin/CLAUDE.md](./apps/admin/CLAUDE.md)**

**Quand l'utiliser** :
- Travailler sur HR (Employés, Planning, Onboarding)
- Travailler sur Pointage (Time tracking, Shifts)
- Travailler sur Comptabilité (Caisse, CA, PDF)
- Migrer modules depuis site vers admin

**Stack** : Tailwind CSS, shadcn/ui, PWA

---

## 🚨 Règles Globales (TOUTES les Apps)

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) { }

// ✅ CORRECT - Toujours typer
import type { UserData } from '@/types/user'
function handleData(data: UserData) { }
```

### 2. Dates - TOUJOURS Strings

```typescript
// ❌ INTERDIT - Timestamps ISO
{ date: new Date().toISOString() }

// ✅ CORRECT - Format simple
{ date: "2026-01-16", time: "09:00" } // YYYY-MM-DD, HH:mm
```

### 3. Fichiers - Max 200 Lignes

| Type | Max | Action |
|------|-----|--------|
| Composants | 200 | Extraire sous-composants/hooks |
| Pages | 150 | Logique → hooks, UI → composants |
| API Routes | 200 | Extraire validation |

### 4. Composants - Réutilisables

```tsx
// ❌ MAUVAIS - Duplication
<HeroOne />, <HeroTwo />

// ✅ BON - Flexible avec children
<Hero variant="full">
  <CustomContent />
</Hero>
```

### 5. Sécurité - Jamais de Secrets

```typescript
// ❌ INTERDIT
const mongoUri = "mongodb+srv://admin:PASSWORD@..."

// ✅ CORRECT
const mongoUri = process.env.MONGODB_URI!
```

---

## 🔧 Commandes Monorepo

```bash
# Installation & Build
pnpm install                              # Tout installer
pnpm build                                # Tout builder

# Développement
pnpm dev                                  # Site + Admin en parallèle

# Apps individuelles
pnpm --filter @coworking-cafe/site dev    # Site seulement
pnpm --filter @coworking-cafe/admin dev   # Admin seulement

# Type-check
pnpm --filter @coworking-cafe/site type-check
pnpm --filter @coworking-cafe/admin type-check
```

---

## 📊 État d'Avancement

### ✅ apps/admin - Production Ready
- Sécurité : 100% routes protégées
- Types : 0 `any`
- Architecture : Fichiers modulaires < 200 lignes
- Build : Réussi (27/27 pages)

### 🚧 apps/site - En Refactorisation
- Phase 1 : Élimination `any` types ✅
- Phase 2 : Correction erreurs TypeScript ✅
- Phase Email : Délivrabilité ✅
- **En cours** : Refactorisation code (fichiers, composants, SCSS)

---

## ⏰ Cron Jobs (Vercel)

**Configuration** : `apps/site/vercel.json`

| Job | Horaire UTC | Endpoint |
|-----|-------------|----------|
| Rappels emails | 10:00 | `/api/cron/send-reminders` |
| No-shows | 10:00 | `/api/cron/check-attendance` |
| Rapport quotidien | 19:00 | `/api/cron/daily-report` |

**Dashboard Vercel** : https://vercel.com/[projet]/settings/crons

---

## 💡 Workflow Recommandé

### Avant de Coder

1. **Identifier l'app** : Site ou Admin ?
2. **Lire le CLAUDE.md** de l'app
3. **Consulter la doc** dans `/apps/[app]/docs/`
4. **Respecter les conventions** globales (ci-dessus)

### Pendant le Développement

- ✅ Zéro `any` types
- ✅ Fichiers < 200 lignes
- ✅ Dates en format string
- ✅ Composants réutilisables
- ✅ Tests manuels

### Avant de Commit

```bash
# Type-check
pnpm --filter @coworking-cafe/[app] type-check

# Build
pnpm --filter @coworking-cafe/[app] build

# Commit si OK
git add .
git commit -m "feat: description"
```

---

## 🚫 Règles de Sécurité Critiques

### Secrets

- ❌ **JAMAIS** de secrets en dur dans code/.md
- ✅ **TOUJOURS** utiliser `process.env.XXX`
- ✅ Placeholders génériques dans docs (`USERNAME`, `PASSWORD`)
- ✅ `.env.local` dans `.gitignore`

### Fichiers .md

| Fichier | Emplacement |
|---------|-------------|
| README.md, CLAUDE.md, CHANGELOG.md | ✅ Racine |
| **Tous les autres .md** | ✅ `/docs/` uniquement |

---

## 🔗 Liens Rapides

- **Site** : [apps/site/CLAUDE.md](./apps/site/CLAUDE.md)
- **Admin** : [apps/admin/CLAUDE.md](./apps/admin/CLAUDE.md)
- **Répertoire** : `/Users/twe/Developer/Thierry/coworking-cafe/`

---

**Dernière mise à jour** : 2026-02-08
**Version** : 2.0
