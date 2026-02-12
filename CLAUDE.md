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

## 🤖 Organisation Team Lead + Agents

### Principe

- **Claude = Team Lead** : Analyse, coordonne, délègue les tâches, ne code pas directement
- **Agents spécialisés** : Exécutent les tâches concrètes (frontend, backend, responsive, SEO, etc.)

### Workflow Type

1. **Analyse** : Le lead analyse la demande et identifie les domaines impactés
2. **Planification** : Création d'une équipe (TeamCreate) et décomposition en tâches atomiques (TaskCreate)
3. **Délégation** : Spawn des agents spécialisés via le Task tool avec instructions précises
4. **Coordination** : Suivi de l'avancement, validation des résultats, résolution des blocages
5. **Clôture** : Shutdown de l'équipe (TeamDelete) une fois toutes les tâches complétées

### Types d'Agents Disponibles

| Agent | Usage | Outils |
|-------|-------|--------|
| **general-purpose** | Tâches complexes multi-étapes, implémentations | Tous outils (Read, Edit, Write, Bash, etc.) |
| **Explore** | Recherche et exploration approfondie du codebase | Read, Glob, Grep, WebFetch |
| **Plan** | Planification architecture avant implémentation | Lecture seule + analyse |
| **Bash** | Opérations git, commandes terminal spécialisées | Bash uniquement |

### Quand Utiliser ce Mode

**✅ Utiliser Team Lead + Agents** :
- Refactorings complexes touchant plusieurs modules/fichiers
- Features impactant plusieurs domaines (ex: frontend + backend + SEO)
- Analyses approfondies nécessitant exploration avant décision
- Migrations architecturales (ex: Bootstrap → Tailwind)

**❌ Mode simple suffit** :
- Bug fix ponctuel sur 1-2 fichiers
- Modification isolée sans impact large
- Question/réponse rapide sans implémentation

### Exemple Concret

```bash
# Utilisateur demande : "Refactoriser le module booking"
#
# Lead :
# 1. TeamCreate "booking-refactor"
# 2. TaskCreate "Extraire hooks" + "Modulariser SCSS" + "Créer composants"
# 3. Spawn 3 agents (frontend, css-specialist, review-specialist)
# 4. Coordonner l'avancement via TaskList
# 5. TeamDelete une fois terminé
```

### Avantages

- 🎯 **Focus** : Chaque agent a un domaine d'expertise clair
- ⚡ **Parallélisation** : Tâches indépendantes exécutées simultanément
- 🔍 **Traçabilité** : Historique clair des tâches et responsables
- 🛡️ **Qualité** : Validation par le lead avant clôture

### Contrôle Qualité Final (Team Lead)

**CRITIQUE** : Avant de valider les tâches, le team lead DOIT faire une review approfondie du travail des agents.

#### Checklist Review Obligatoire

**1. Conformité CLAUDE.md**
- [ ] Zéro `any` types
- [ ] Fichiers < 200 lignes (composants), < 250 (hooks), < 150 (pages)
- [ ] Dates en format string (YYYY-MM-DD, HH:mm)
- [ ] Pas de secrets en dur
- [ ] Composants réutilisables (children)

**2. Qualité Code**
- [ ] Noms explicites et descriptifs
- [ ] Fonctions < 50 lignes
- [ ] Gestion d'erreurs présente (try/catch, Result pattern)
- [ ] Commentaires pertinents (le "pourquoi", pas le "quoi")
- [ ] Pas de duplication de code

**3. Validation Technique**
- [ ] Type-check : `pnpm --filter @coworking-cafe/[app] type-check`
- [ ] Build : `pnpm --filter @coworking-cafe/[app] build`
- [ ] Pas de régression fonctionnelle
- [ ] Aucune erreur causée par les nouveaux fichiers

**4. Architecture**
- [ ] Respect des patterns existants
- [ ] Séparation responsabilités claire (logique/présentation)
- [ ] Imports/exports corrects
- [ ] Hooks extraits si composant > 100 lignes

#### Actions si Non-Conformité

- ❌ **Si erreurs critiques** : Créer nouvelle task de correction et réassigner à l'agent
- ⚠️ **Si warnings mineurs** : Documenter dans le rapport et corriger plus tard
- ✅ **Si conforme** : Valider la task et passer à la suivante

#### Rapport Final

Le lead doit fournir un rapport structuré :
```markdown
## Audit Task #[N] - [Nom Agent]

### ✅ Conformités
- [Liste des points conformes]

### ⚠️ Warnings (si applicable)
- [Points d'amélioration non bloquants]

### ❌ Non-Conformités (si applicable)
- [Problèmes bloquants à corriger]

### 📋 Recommandations
- [Suggestions pour améliorer le code]
```

### Team Permanente vs Team Temporaire

#### Deux Approches

**Option A : Team Temporaire** (ancienne approche)
```bash
TeamCreate "feature-x" → Spawner agents → Shutdown → TeamDelete
```
- ✅ Clean entre chaque mission
- ❌ Overhead de création/suppression
- ❌ Historique perdu

**Option B : Team Permanente** (recommandé pour ce projet)
```bash
TeamCreate "coworking-team" → Garder active en permanence
└─ Spawner/Shutdown agents au besoin
```
- ✅ Pas de recréation à chaque fois
- ✅ Historique des tasks persistant
- ✅ Pool d'agents standards prêts à spawner
- ✅ Continuité entre les sessions

#### Pool d'Agents Permanent (Approche Évolutive)

**Philosophie** : Commencer avec un pool de base léger, puis l'enrichir naturellement selon les besoins réels du projet.

##### Phase 1 : Pool de Base (8 agents standards)

Agents polyvalents, utilisables sur n'importe quelle feature :

| Agent | Spécialité | Quand le spawner |
|-------|------------|------------------|
| **backend-specialist** | API Routes, Webhooks, DB, Auth, Services externes | Routes API, intégrations Stripe/MongoDB, webhooks |
| **frontend-specialist** | React, Hooks, Composants, UI/UX | Pages, composants, hooks personnalisés |
| **responsive-specialist** | Mobile-first, Breakpoints, Tailwind/SCSS, PWA | Design responsive, adaptation mobile, PWA |
| **seo-specialist** | Metadata, Sitemap, Robots, Performance, Analytics | SEO, OpenGraph, optimisation images, Core Web Vitals |
| **review-specialist** | Contrôle qualité, audits, validation | Validation finale avant commit/deploy |
| **doc-specialist** | Documentation, CLAUDE.md, README, guides | Mise à jour docs, création guides |
| **refactoring-specialist** | Architecture, modularisation, cleanup | Refacto complexes, réduction taille fichiers |
| **test-specialist** | Tests unitaires, intégration, E2E | Ajout/correction tests, debugging |

##### Phase 2 : Agents Spécialisés Promus (ajout progressif)

**Critères pour promouvoir un agent au pool permanent** :
- ✅ Utilisé **3+ fois** dans des contextes différents
- ✅ Domain expertise nécessaire régulièrement
- ✅ Historique de travail utile à préserver

**Agents candidats à la promotion** :
- `clocking-specialist` → Si besoins récurrents sur HR/Pointage
- `booking-specialist` → Si besoins récurrents sur Réservations
- `payment-specialist` → Si besoins récurrents sur Stripe/Paiements
- `email-specialist` → Si besoins récurrents sur Emails/Notifications

**Workflow de promotion** :
```bash
# 1ère utilisation → Spawner ponctuel
Task --name clocking-specialist --team coworking-team

# 2ème utilisation → Réutiliser (historique préservé)
Task --name clocking-specialist --team coworking-team

# 3ème utilisation → Promouvoir
# Ajouter "clocking-specialist" au tableau ci-dessus
# Documenter sa spécialité et quand le spawner
```

##### Avantages de l'Approche Évolutive

- 🎯 **Pool léger au départ** : 8 agents au lieu de 15+
- 📈 **Croissance naturelle** : Basée sur besoins réels, pas théoriques
- 📚 **Historique préservé** : Agents fréquents gardent leur contexte
- 🚀 **Pas de recréation** : Agent déjà connu, pas de setup à chaque fois
- 🧹 **Pas de bloat** : On n'ajoute que ce qui est vraiment utilisé

#### Workflow avec Team Permanente

```bash
# 1. Créer la team permanente (une seule fois)
TeamCreate "coworking-team"

# 2. Pour chaque mission, spawner les agents nécessaires
Task --subagent_type general-purpose --name backend-specialist --team coworking-team
Task --subagent_type general-purpose --name frontend-specialist --team coworking-team

# 3. Une fois la mission terminée, shutdown les agents
SendMessage type=shutdown_request recipient=backend-specialist
SendMessage type=shutdown_request recipient=frontend-specialist

# 4. La team reste active pour la prochaine mission
# (Pas de TeamDelete, elle reste en permanence)

# 5. Pour nettoyer les anciennes tasks (si besoin)
# Marquer les tasks completed avec TaskUpdate
```

#### Gestion des Tasks

Avec une team permanente :
- Les tasks s'accumulent dans `~/.claude/tasks/coworking-team/`
- Marquer les tasks `completed` avec TaskUpdate quand terminées
- Les tasks completed restent dans l'historique (traçabilité)
- Créer de nouvelles tasks pour chaque nouvelle mission

#### Quand Créer une Nouvelle Team

Garder `coworking-team` active SAUF si :
- ❌ Changement majeur de scope (nouveau projet)
- ❌ Besoin de reset complet de l'historique
- ❌ Team corrompue ou problématique

Sinon, **toujours réutiliser la même team** pour continuité.

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

**Dernière mise à jour** : 2026-02-12
**Version** : 2.1
