# CLAUDE.md - Admin App Development Guide

> **App** : `/apps/admin/` - Dashboard Admin du Coworking Café
> **Version** : 1.2
> **Status** : ✅ Production Ready

---

## 📋 Vue d'Ensemble

Dashboard Next.js 14 pour gérer :
- 👥 **HR** : Employés, contrats, onboarding, disponibilités
- ⏰ **Pointage** : Time tracking, shifts, planning
- 💰 **Comptabilité** : Caisse, chiffre d'affaires, PDF
- 📊 **Analytics** : Stats et rapports
- 📝 **Actualités** : Blog & Événements (contenu site public)

**Stack** : Next.js 14 · TypeScript · Tailwind · shadcn/ui · MongoDB · NextAuth

### 📧 Emails

**IMPORTANT** : N'utilisez **JAMAIS Resend** pour l'envoi d'emails.

✅ **Utiliser** : Package partagé `@coworking-cafe/email` avec SMTP
```typescript
import { sendEmail } from "@/lib/email/emailService";

await sendEmail({
  to: "user@example.com",
  subject: "Sujet",
  html: "<p>Contenu HTML</p>",
  attachments: [{ filename: "file.pdf", content: buffer }]
});
```

❌ **Ne PAS utiliser** : Resend, SendGrid, ou autres services tiers

---

## ⚠️ CONVENTION CRITIQUE : Structure des routes Admin vs Staff

**IMPORTANT** : Il existe DEUX dossiers distincts pour les routes avec sidebar :

### 📁 Structure

```
apps/admin/src/app/
├── (dashboard)/         # Routes STAFF (accès basique)
│   ├── layout.tsx       # Layout avec sidebar
│   ├── page.tsx         # "/" - Accueil Staff
│   ├── planning/        # "/planning"
│   ├── agenda/          # "/agenda"
│   ├── cash-register/   # "/cash-register"
│   └── produits/        # "/produits"
│
└── admin/               # Routes ADMIN (accès admin/dev)
    ├── layout.tsx       # Hérite du layout (dashboard)
    ├── page.tsx         # "/admin" - Dashboard Admin
    ├── hr/              # "/admin/hr"
    ├── accounting/      # "/admin/accounting"
    ├── booking/         # "/admin/booking"
    ├── messages/        # "/admin/messages"
    ├── blog/            # "/admin/blog"
    └── events/          # "/admin/events"
```

### ✅ CORRECT

**Routes Staff (accès basique)** → `app/(dashboard)/`
```
app/(dashboard)/planning/page.tsx        → /planning
app/(dashboard)/agenda/page.tsx          → /agenda
app/(dashboard)/cash-register/page.tsx   → /cash-register
```

**Routes Admin (accès admin/dev)** → `app/admin/`
```
app/admin/hr/page.tsx                    → /admin/hr
app/admin/blog/articles/page.tsx         → /admin/blog/articles
app/admin/events/page.tsx                → /admin/events
```

### ❌ INCORRECT

```
app/(dashboard)/admin/blog/              # ❌ NE PAS mettre admin dans (dashboard)
app/(protected)/events/                  # ❌ (protected) n'existe pas
app/blog/                                # ❌ Sans (dashboard) = pas de sidebar
```

### 🎯 Règle simple

- **Staff** (planning, agenda, produits...) → `app/(dashboard)/`
- **Admin** (hr, blog, events, booking...) → `app/admin/`
- Les deux héritent du layout avec sidebar
- Les deux sont protégés par auth (via middleware)

---

## 🎯 Contexte Important

### Historique

L'app a été **entièrement refactorisée** (Janvier 2026) :
- ✅ Sécurité : 100% routes protégées
- ✅ Types : 0 `any`, interfaces partagées
- ✅ Architecture : APIs consolidées, fichiers < 200 lignes
- ✅ Build : Réussi (27/27 pages)

### Prochaine Étape

Migration progressive de modules depuis `/apps/site/src/app/dashboard/` :
- 📅 Booking (réservations, calendrier)
- 💬 Messages (chat, notifications)
- ⚙️ Settings (espaces, horaires)
- 📊 Analytics avancées

**✅ NOTE** : L'architecture est maintenant stable. Les composants validés ne doivent pas être recréés différemment sans raison.

---

## 🚨 Règles CRITIQUES (À Respecter Absolument)

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) { }

// ✅ CORRECT
import type { Employee } from '@/types/hr'
function handleData(data: Employee) { }
```

### 2. Dates - TOUJOURS des Strings

```typescript
// ❌ INTERDIT
{ date: new Date().toISOString() }

// ✅ CORRECT
{ date: "2026-01-16", time: "09:00" } // YYYY-MM-DD, HH:mm
```

### 3. Taille Fichiers - Max 200 Lignes

| Type | Max | Action si dépassé |
|------|-----|-------------------|
| Composants React | 200 | Extraire hooks/sous-composants |
| API Routes | 200 | Extraire validation/logique |
| Models | 150 | Structure modulaire (5 fichiers) |

### 4. Sécurité - Auth OBLIGATOIRE

```typescript
// ✅ TOUJOURS en première ligne
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response
  // ...
}
```

### 5. Secrets - JAMAIS en Dur

```typescript
// ❌ INTERDIT
const mongoUri = "mongodb+srv://admin:PASSWORD@..."

// ✅ CORRECT
const mongoUri = process.env.MONGODB_URI!
```

---

## 📚 Documentation Détaillée

**Toute la documentation est dans `/docs/`** :

### 🏗️ Architecture & Structure
→ **[ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md)**
- Structure des dossiers
- Organisation des models (pattern modulaire)
- Où placer les fichiers
- Flux de données

### ✅ Conventions de Code
→ **[CONVENTIONS.md](./docs/guides/CONVENTIONS.md)**
- TypeScript strict (zéro `any`)
- Formats dates/heures (strings)
- Taille des fichiers (limites)
- Nommage (fichiers, variables, fonctions)
- Composants réutilisables
- Imports & gestion d'erreurs

### 🔒 Sécurité & Authentification
→ **[SECURITY.md](./docs/guides/SECURITY.md)**
- Pattern `requireAuth()` obligatoire
- Rôles & permissions (dev/admin/staff)
- Distinction rôles système vs métier
- Routes publiques (exceptions)
- Secrets (JAMAIS en dur)
- Checklist sécurité

### 🌐 API Routes
→ **[API_GUIDE.md](./docs/guides/API_GUIDE.md)**
- Structure d'une route API
- Helpers (requireAuth, successResponse, errorResponse)
- Status codes appropriés
- Gestion d'erreurs
- Query params & body parsing
- Routes dynamiques ([id])

### 🎨 Composants React
→ **[COMPONENTS_GUIDE.md](./docs/guides/COMPONENTS_GUIDE.md)**
- Pattern Skeleton Loading (obligatoire)
- Pattern Page d'Index (sections avec sous-menus)
- Structure d'un composant
- Hooks personnalisés
- Checklist composant

### 🔄 Migration depuis /apps/site
→ **[MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md)**
- Philosophie : réécriture, pas copier-coller
- Workflow migration (8 étapes)
- APIs partagées (site public + admin)
- Renommage de models
- Préservation structure models
- Nettoyage assets (SCSS, images)
- Checklist migration complète

### 📦 Types Partagés
→ **[TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md)**
- Single Source of Truth (`/types/`)
- Types principaux disponibles (hr, timeEntry, accounting)
- Créer un nouveau type
- Patterns utiles (Extend, Omit, Pick, Generics)
- Conventions nommage
- Type guards & validation

### 🧪 Tests
→ **[TESTING.md](./docs/guides/TESTING.md)**
- Tests manuels obligatoires (checklist)
- Vérifications techniques (TypeScript, build, console)
- Tests par feature (auth, CRUD, UI/UX)
- Tests d'intégration (scénarios)
- Debugging (logs, DevTools, Network)
- Checklist avant commit

### 💡 Questions Fréquentes
→ **[FAQ.md](./docs/guides/FAQ.md)**
- Organisation & structure
- TypeScript & types
- Sécurité & auth
- Dates & heures
- Taille des fichiers
- Composants & UI
- API Routes
- Migration
- Debugging
- Performance
- Secrets

---

## 🎯 Checklist Avant de Coder

**Avant de commencer une feature** :

- [ ] J'ai lu ce CLAUDE.md
- [ ] J'ai consulté la doc pertinente dans `/docs/`
- [ ] Je connais les types à utiliser (`/types/`)
- [ ] Je connais les helpers disponibles (`/lib/api/`)
- [ ] Je sais où placer mes fichiers
- [ ] Je respecterai les limites de lignes (200 max)
- [ ] Je n'utiliserai pas `any`
- [ ] J'utiliserai des strings pour dates/heures
- [ ] Je protégerai mes APIs avec `requireAuth()`
- [ ] Je testerai manuellement avant de commit

---

## 💡 En Cas de Doute

**Questions rapides** :

| Question | Réponse |
|----------|---------|
| Où mettre ce fichier ? | → [ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md) |
| Comment typer ? | → [TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md) |
| Cette API doit être protégée ? | → OUI (sauf auth/verify-pin/clock-in/out) |
| 300 lignes c'est grave ? | → OUI, découper ([CONVENTIONS.md](./docs/guides/CONVENTIONS.md)) |
| Date ou string ? | → TOUJOURS string (YYYY-MM-DD, HH:mm) |
| Comment migrer un module ? | → [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md) |

**Plus de réponses** : [FAQ.md](./docs/guides/FAQ.md)

---

## ✅ Status Actuel

**Version** : 1.1
**Status** : ✅ Production Ready

### Modules Implémentés

- ✅ Auth (NextAuth avec rôles)
- ✅ HR (Employés, Planning, Disponibilités, Onboarding)
- ✅ Pointage (Time tracking, Shifts manuels)
- ✅ Comptabilité (Caisse, CA, PDF)
- ✅ Dashboard (Stats, Navigation)
- ✅ Pages d'erreur (404, 403, 401, 500)

### Qualité

- ✅ Sécurité : 100% routes protégées
- ✅ Types : 0 `any`, types partagés
- ✅ Architecture : Fichiers < 200 lignes
- ✅ Build : Réussi
- ✅ Documentation : Complète

### À Migrer

- [ ] Booking (réservations, calendrier) - 2 jours
- [ ] Messages (chat, notifications) - 3 jours
- [ ] Settings (espaces, horaires) - 1 jour
- [ ] Analytics avancées - 2 jours

**Suivi détaillé** : `/docs/MIGRATION_STATUS.md`

---

## 🚀 Workflow Recommandé

### Nouvelle Feature

```
1. Lire ce CLAUDE.md
2. Consulter docs/ pertinents
3. Analyser code existant (patterns)
4. Créer types → models → APIs → composants
5. Tester manuellement (TESTING.md)
6. Type-check + Build
7. Commit
```

### Migration Module

```
1. Analyser module source (30 min)
2. Classifier APIs (partagée/dashboard/site)
3. Créer types (1h)
4. Créer models (1-2h)
5. Créer APIs (2-3h)
6. Créer composants (3-4h)
7. Créer hooks (1h)
8. Créer pages (2h)
9. Tests manuels (1h)
10. Documentation (30 min)

Total : 1-2 jours/module
```

**Guide complet** : [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md)

---

## 📖 Liens Rapides

### Documentation
- [ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md) - Structure & organisation
- [CONVENTIONS.md](./docs/guides/CONVENTIONS.md) - Règles de code
- [SECURITY.md](./docs/guides/SECURITY.md) - Auth & sécurité
- [API_GUIDE.md](./docs/guides/API_GUIDE.md) - Patterns API
- [COMPONENTS_GUIDE.md](./docs/guides/COMPONENTS_GUIDE.md) - Composants React
- [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md) - Migration depuis site
- [TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md) - Types partagés
- [TESTING.md](./docs/guides/TESTING.md) - Tests manuels
- [FAQ.md](./docs/guides/FAQ.md) - Questions fréquentes

### Fichiers Importants
- `/TESTING_CHECKLIST.md` - Checklist tests détaillée
- `/docs/refactoring/REFACTORING_SUMMARY.txt` - Historique refactoring
- `/docs/migration/MIGRATION_STATUS.md` - Suivi des migrations

### Documentation Externe
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📝 Commandes Utiles

```bash
# Développement
pnpm dev                      # Lancer serveur dev
pnpm type-check               # Vérifier TypeScript
pnpm build                    # Builder l'app

# Tests
pnpm exec tsc --noEmit        # Type check complet

# Base de données (si besoin)
# Voir /docs/ARCHITECTURE.md pour connexion MongoDB
```

---

**Dernière mise à jour** : 2026-02-08
**Auteur** : Thierry + Claude
**Version** : 1.1

---

*Ce fichier est le point d'entrée de la documentation. Consulte `/docs/` pour les guides détaillés ! 🚀*
