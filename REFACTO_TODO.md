# REFACTO TODO - Plan Complet d'Automatisation & Clean Architecture

> **Status** : 📋 En attente (à démarrer après feature urgente)
> **Durée estimée** : 4-5 semaines
> **Date création** : 2026-03-11

---

## 📋 Vue d'Ensemble

### Objectifs

1. ✅ **Automatisation** : Pre-commit hooks, TypeScript strict, ESLint rules
2. ✅ **Clean Code** : Fix 55 erreurs TypeScript, refacto fichiers > 200 lignes
3. ✅ **Clean DB** : Renommage collections MongoDB (ex: `inventory-orders`)
4. ✅ **Clean Docs** : Restructuration CLAUDE.md modulaire par feature

### Métriques Actuelles (Baseline)

```
TypeScript Errors : 55 (49 admin + 6 site)
Files > 200 lines : 6+ fichiers
new Date() usage  : 15+ fichiers
Collections DB    : Nommage inconsistant (suppliers vs inventory-products)
CLAUDE.md         : Monolithique (500+ lignes)
Test Coverage     : 0%
```

### Métriques Cibles

```
TypeScript Errors : 0
Files > 200 lines : 0
new Date() usage  : 0 (dates as strings)
Collections DB    : Préfixe cohérent (module-collection)
CLAUDE.md         : Modulaire (<200 lignes par fichier)
Test Coverage     : 50%+ (logique métier)
```

---

## 🌳 Branching Strategy

### Approche : Incremental Merges

```
main ─────M1────M2────M3────M4────...────M12──────►
       \  /  \  /  \  /  \  /         \  /
        ─S1───S2───S3───S4───...───────S12──
        refacto/automation (sync quotidien avec main)
```

**Commandes** :

```bash
# 1. Créer branche refacto
git checkout main
git pull origin main
git checkout -b refacto/automation
git push -u origin refacto/automation

# 2. Après chaque étape (PR merged)
git checkout refacto/automation
git pull origin main --rebase  # Sync quotidien

# 3. Feature urgente pendant refacto ?
# → Si indépendante : créer depuis main
# → Si dépendante : créer depuis refacto/automation
```

---

## 📅 Timeline (4-5 Semaines)

| Phase | Durée | PRs | Risque |
|-------|-------|-----|--------|
| **Phase 0 : Préparation** | 3j | 2 | Faible |
| **Phase 1 : Audit & Scripts** | 1j | 1 | 0% |
| **Phase 2 : Fix TypeScript** | 5j | 2 | Faible |
| **Phase 3 : Clean Database** | 3j | 1 | Moyen |
| **Phase 4 : Refacto App** | 10j | 4 | Moyen |
| **Phase 5 : Enforcement** | 3j | 3 | Faible |
| **Phase 6 : Tests** | 10j | - | Faible |

**Total** : ~35 jours (5 semaines)

---

## 🚀 PHASE 0 : Préparation (3 jours, 2 PRs)

### PR #0.1 : Restructuration Documentation (1 jour)

**Objectif** : CLAUDE.md modulaire par feature

**Structure cible** :

```
/docs/
├── CLAUDE.md (guide principal - 150 lignes max)
├── modules/
│   ├── BOOKING.md (architecture booking complète)
│   ├── INVENTORY.md (architecture inventory complète)
│   ├── HR.md (architecture HR complète)
│   ├── ACCOUNTING.md (architecture comptabilité)
│   ├── MESSAGES.md (architecture messages)
│   └── PROMO.md (architecture promo/QR codes)
├── conventions/
│   ├── TYPESCRIPT.md (règles TypeScript strictes)
│   ├── REACT.md (patterns composants/hooks)
│   ├── API.md (patterns API routes)
│   ├── DATABASE.md (conventions MongoDB)
│   └── SCSS.md (conventions BEM/styles)
└── guides/
    ├── SETUP.md (installation dev environment)
    ├── DEPLOYMENT.md (deploy Vercel)
    └── TESTING.md (testing manual + auto)
```

**CLAUDE.md nouveau** (structure) :

```markdown
# CLAUDE.md - CoworKing Café Monorepo

## 📋 Quick Start
- [Setup Dev Environment](./docs/guides/SETUP.md)
- [Deployment](./docs/guides/DEPLOYMENT.md)

## 🏗️ Architecture
- [apps/site](./apps/site/CLAUDE.md) - Site public + Dashboard client
- [apps/admin](./apps/admin/CLAUDE.md) - Dashboard admin

## 📚 Modules
- [Booking](./docs/modules/BOOKING.md) - Réservations
- [Inventory](./docs/modules/INVENTORY.md) - Gestion stock
- [HR](./docs/modules/HR.md) - Ressources humaines
- [Accounting](./docs/modules/ACCOUNTING.md) - Comptabilité
- [Messages](./docs/modules/MESSAGES.md) - Messagerie
- [Promo](./docs/modules/PROMO.md) - QR codes & promotions

## 🎯 Conventions
- [TypeScript](./docs/conventions/TYPESCRIPT.md) - Zéro `any`, types stricts
- [React](./docs/conventions/REACT.md) - Composants, hooks
- [API Routes](./docs/conventions/API.md) - Auth, responses
- [Database](./docs/conventions/DATABASE.md) - MongoDB, naming
- [SCSS](./docs/conventions/SCSS.md) - BEM, nommage

## 🚨 Règles Critiques (Résumé)
✅ TypeScript : Zéro `any`
✅ Dates : Strings ONLY (YYYY-MM-DD, HH:mm)
✅ Fichiers : Max 200 lignes (components), 250 (hooks), 150 (pages)
✅ Auth : `requireAuth()` obligatoire (sauf routes publiques)
✅ Secrets : JAMAIS en dur
```

**Commandes** :

```bash
# Créer structure
mkdir -p docs/{modules,conventions,guides}

# Créer fichiers
touch docs/modules/{BOOKING,INVENTORY,HR,ACCOUNTING,MESSAGES,PROMO}.md
touch docs/conventions/{TYPESCRIPT,REACT,API,DATABASE,SCSS}.md
touch docs/guides/{SETUP,DEPLOYMENT,TESTING}.md

# Extraire contenu CLAUDE.md actuel dans fichiers spécialisés
# (À faire manuellement en copiant sections pertinentes)

# Commit
git add docs/ CLAUDE.md apps/*/CLAUDE.md
git commit -m "docs: restructure CLAUDE.md into modular architecture

- Split monolithic CLAUDE.md into modules
- Create dedicated docs for each feature (booking, HR, etc.)
- Extract conventions into separate files
- Main CLAUDE.md now < 150 lines (index only)

Refs: #refacto"

# PR
gh pr create \
  --base main \
  --head refacto/automation \
  --title "docs: Restructure documentation (Phase 0.1)" \
  --body "**Changes**
- Modular documentation by feature
- Main CLAUDE.md < 150 lines
- Easier navigation and maintenance

**Files**
- 15 new doc files
- CLAUDE.md restructured

**Impact**: Documentation only, 0 code change"
```

**Checklist** :
- [ ] Créer structure dossiers
- [ ] Créer fichiers modules (6 fichiers)
- [ ] Créer fichiers conventions (5 fichiers)
- [ ] Créer fichiers guides (3 fichiers)
- [ ] Extraire contenu CLAUDE.md actuel
- [ ] Mettre à jour CLAUDE.md principal
- [ ] Review & merge PR

---

### PR #0.2 : Plan Migration DB Collections (2 jours)

**Objectif** : Documenter + scripter renommage collections MongoDB

**Collections à renommer** :

```javascript
// AVANT (inconsistant)
users                    // ✅ Global (OK)
sessions                 // ✅ Global (OK)
employees                // ✅ Global (OK)
suppliers                // ❌ Devrait être inventory-suppliers
products                 // ❌ Devrait être inventory-products
entries                  // ❌ Devrait être inventory-entries
orders                   // ❌ Devrait être inventory-orders

// APRÈS (cohérent)
users                    // ✅ Global
sessions                 // ✅ Global
employees                // ✅ Global
inventory-suppliers      // ✅ Préfixe module
inventory-products       // ✅ Préfixe module
inventory-entries        // ✅ Préfixe module
inventory-orders         // ✅ Préfixe module
booking-reservations     // ✅ Si besoin
booking-payments         // ✅ Si besoin
hr-absences              // ✅ Si besoin
hr-contracts             // ✅ Si besoin
```

**Script migration** :

```typescript
// scripts/migrate-db-collections.ts
import mongoose from 'mongoose';
import { connectDB } from '@coworking-cafe/database';

interface CollectionMapping {
  from: string;
  to: string;
  module: string;
}

const MIGRATIONS: CollectionMapping[] = [
  // Inventory module
  { from: 'suppliers', to: 'inventory-suppliers', module: 'inventory' },
  { from: 'products', to: 'inventory-products', module: 'inventory' },
  { from: 'entries', to: 'inventory-entries', module: 'inventory' },
  { from: 'orders', to: 'inventory-orders', module: 'inventory' },

  // Booking module (si collections existent)
  // { from: 'reservations', to: 'booking-reservations', module: 'booking' },

  // HR module (si collections existent)
  // { from: 'absences', to: 'hr-absences', module: 'hr' },
];

async function migrateCollections() {
  await connectDB();

  console.log('🚀 Starting collection migration...\n');

  for (const { from, to, module } of MIGRATIONS) {
    console.log(`📦 Migrating: ${from} → ${to} (${module})`);

    try {
      // 1. Vérifier si collection source existe
      const collections = await mongoose.connection.db.listCollections({ name: from }).toArray();

      if (collections.length === 0) {
        console.log(`  ⚠️  Collection "${from}" not found, skipping\n`);
        continue;
      }

      // 2. Compter documents
      const count = await mongoose.connection.db.collection(from).countDocuments();
      console.log(`  📊 ${count} documents to migrate`);

      // 3. Renommer collection
      await mongoose.connection.db.collection(from).rename(to);
      console.log(`  ✅ Renamed successfully\n`);

    } catch (error) {
      console.error(`  ❌ Error migrating ${from}:`, error);
      console.log(`  ⏭️  Continuing with next collection...\n`);
    }
  }

  console.log('✅ Migration complete!');
  await mongoose.connection.close();
}

// Dry-run mode (preview sans exécution)
async function dryRun() {
  await connectDB();

  console.log('🔍 DRY RUN - Preview of migrations:\n');

  for (const { from, to, module } of MIGRATIONS) {
    const collections = await mongoose.connection.db.listCollections({ name: from }).toArray();

    if (collections.length > 0) {
      const count = await mongoose.connection.db.collection(from).countDocuments();
      console.log(`✅ ${from} → ${to} (${count} docs) [${module}]`);
    } else {
      console.log(`⚠️  ${from} → ${to} (not found) [${module}]`);
    }
  }

  await mongoose.connection.close();
}

// CLI
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  dryRun();
} else {
  console.log('⚠️  WARNING: This will rename collections in database!');
  console.log('⚠️  Run with --dry-run first to preview changes.\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Continue? (yes/no): ', (answer: string) => {
    if (answer.toLowerCase() === 'yes') {
      migrateCollections();
    } else {
      console.log('❌ Migration cancelled');
    }
    readline.close();
  });
}
```

**Mise à jour Models** :

```typescript
// packages/database/src/models/inventory/Supplier.ts
// AVANT
export const Supplier = mongoose.models.Supplier ||
  mongoose.model<SupplierDocument>('Supplier', SupplierSchema);
  // → Collection: "suppliers"

// APRÈS
export const Supplier = mongoose.models.Supplier ||
  mongoose.model<SupplierDocument>(
    'Supplier',
    SupplierSchema,
    'inventory-suppliers'  // ← Nom collection explicite
  );
```

**Commandes** :

```bash
# 1. Créer script
touch scripts/migrate-db-collections.ts

# 2. Ajouter script dans package.json
# "migrate:db": "tsx scripts/migrate-db-collections.ts"
# "migrate:db:dry-run": "tsx scripts/migrate-db-collections.ts --dry-run"

# 3. Dry-run (preview)
pnpm migrate:db:dry-run

# 4. Backup DB AVANT migration
# (Via MongoDB Atlas UI ou mongodump)

# 5. Migration réelle (APRÈS backup)
pnpm migrate:db

# 6. Mettre à jour tous les models
# Ajouter 3ème paramètre avec nom collection

# Commit
git add scripts/ packages/database/
git commit -m "feat: add MongoDB collection migration script

- Script to rename collections with module prefix
- Update models to use explicit collection names
- Dry-run mode for safety

Collections:
- suppliers → inventory-suppliers
- products → inventory-products
- entries → inventory-entries
- orders → inventory-orders

Refs: #refacto"

# PR
gh pr create \
  --title "feat: MongoDB collection naming migration (Phase 0.2)" \
  --body "**Changes**
- Migration script for collection renaming
- Update models with explicit collection names
- Follows CLAUDE.md convention (module-collection)

**Usage**
\`\`\`bash
# Preview
pnpm migrate:db:dry-run

# Execute (after backup!)
pnpm migrate:db
\`\`\`

**Collections**
- suppliers → inventory-suppliers
- products → inventory-products
- entries → inventory-entries
- orders → inventory-orders

**⚠️ IMPORTANT**
- Backup DB before running
- Test in dev first
- Run during low-traffic period"
```

**Checklist** :
- [ ] Créer script migration
- [ ] Tester dry-run en local
- [ ] Backup DB production
- [ ] Tester migration en dev
- [ ] Mettre à jour models (3ème param)
- [ ] Tester app après migration dev
- [ ] Review & merge PR
- [ ] Exécuter migration production (après merge)

---

## 🔍 PHASE 1 : Audit & Scripts (1 jour, 1 PR)

### PR #1 : Scripts Validation (1 jour, 0 risque)

**Objectif** : Scripts audit état actuel (read-only)

**Script 1 : Validation Conventions** :

```typescript
// scripts/validate-conventions.ts
#!/usr/bin/env tsx
import fs from 'fs';
import { glob } from 'glob';

interface Violation {
  file: string;
  line?: number;
  type: string;
  message: string;
}

const violations: Violation[] = [];

async function validateConventions() {
  const files = await glob('apps/**/src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**']
  });

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // 1. Check for `new Date()`
    lines.forEach((line, idx) => {
      if (line.includes('new Date()')) {
        violations.push({
          file,
          line: idx + 1,
          type: 'DATE_USAGE',
          message: "Uses 'new Date()' instead of date strings (YYYY-MM-DD)"
        });
      }
    });

    // 2. Check for `any` types
    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches) {
      violations.push({
        file,
        type: 'ANY_TYPE',
        message: `Contains ${anyMatches.length} 'any' type(s)`
      });
    }

    // 3. Check file size
    const lineCount = lines.length;
    const type = file.includes('/components/') ? 'component' :
                 file.includes('/hooks/') ? 'hook' :
                 file.endsWith('page.tsx') ? 'page' : null;

    const limits: Record<string, number> = {
      component: 200,
      hook: 250,
      page: 150
    };

    if (type && lineCount > limits[type]) {
      violations.push({
        file,
        type: 'FILE_SIZE',
        message: `${lineCount} lines (max ${limits[type]} for ${type}s)`
      });
    }
  }

  // Report
  console.log('\n📊 VALIDATION REPORT\n');
  console.log('='.repeat(60));

  if (violations.length === 0) {
    console.log('✅ All conventions respected!\n');
    process.exit(0);
  }

  // Group by type
  const byType = violations.reduce((acc, v) => {
    acc[v.type] = acc[v.type] || [];
    acc[v.type].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);

  Object.entries(byType).forEach(([type, items]) => {
    console.log(`\n❌ ${type} (${items.length})`);
    items.slice(0, 10).forEach(v => {
      console.log(`  - ${v.file}${v.line ? `:${v.line}` : ''}`);
      console.log(`    ${v.message}`);
    });
    if (items.length > 10) {
      console.log(`  ... and ${items.length - 10} more`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total violations: ${violations.length}\n`);

  process.exit(1);
}

validateConventions();
```

**Script 2 : Audit TypeScript** :

```typescript
// scripts/audit-typescript.ts
#!/usr/bin/env tsx
import { execSync } from 'child_process';

function auditTypeScript(app: string) {
  console.log(`\n📊 Auditing TypeScript errors: ${app}\n`);

  try {
    execSync(`pnpm --filter ${app} exec tsc --noEmit`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    console.log(`✅ ${app}: 0 TypeScript errors\n`);
    return 0;

  } catch (error: any) {
    const output = error.stdout || '';
    const errorLines = output.split('\n').filter((line: string) =>
      line.includes('error TS')
    );

    console.log(`❌ ${app}: ${errorLines.length} TypeScript errors\n`);

    // Show first 10 errors
    errorLines.slice(0, 10).forEach((line: string) => console.log(`  ${line}`));

    if (errorLines.length > 10) {
      console.log(`  ... and ${errorLines.length - 10} more\n`);
    }

    return errorLines.length;
  }
}

// Audit both apps
const siteErrors = auditTypeScript('@coworking-cafe/site');
const adminErrors = auditTypeScript('@coworking-cafe/admin');

console.log('='.repeat(60));
console.log(`Total TypeScript errors: ${siteErrors + adminErrors}`);
console.log('='.repeat(60) + '\n');

process.exit(siteErrors + adminErrors > 0 ? 1 : 0);
```

**Commandes** :

```bash
# Installer deps
pnpm add -D glob tsx

# Ajouter scripts package.json
# "validate": "tsx scripts/validate-conventions.ts"
# "audit:ts": "tsx scripts/audit-typescript.ts"
# "audit:all": "pnpm audit:ts && pnpm validate"

# Tester
pnpm audit:all

# Commit
git add scripts/ package.json
git commit -m "feat: add code quality audit scripts

- validate-conventions.ts: Check CLAUDE.md rules
- audit-typescript.ts: Count TypeScript errors

Baseline audit results:
- TypeScript: 55 errors (49 admin + 6 site)
- new Date(): 15+ usages
- Files > 200 lines: 6+

Refs: #refacto"

# PR
gh pr create --title "feat: Add validation scripts (Phase 1)" --body "..."
```

**Checklist** :
- [ ] Créer scripts
- [ ] Tester localement
- [ ] Documenter baseline
- [ ] Review & merge

---

## 🔧 PHASE 2 : Fix TypeScript (5 jours, 2 PRs)

### PR #2 : Fix TypeScript apps/site (1 jour)

```bash
# Analyser erreurs
pnpm --filter @coworking-cafe/site exec tsc --noEmit > errors-site.txt

# Fixer 6 erreurs
# ... commits ...

# Tests manuels STRICTS
pnpm --filter @coworking-cafe/site dev
# → Tester booking, dashboard, blog

# Commit
git commit -m "fix(site): resolve 6 TypeScript errors"

# PR
gh pr create --title "fix(site): Resolve TypeScript errors (Phase 2.1)"
```

**Checklist** :
- [ ] Analyser 6 erreurs
- [ ] Fixer une par une
- [ ] Tests manuels
- [ ] Type-check passe
- [ ] Build réussit
- [ ] Review & merge

---

### PR #3-6 : Fix TypeScript apps/admin (4 jours, 4 PRs)

**Stratégie** : 1 PR par module (~10 erreurs max)

```bash
# PR #3 : Module HR (10 erreurs)
# PR #4 : Module Inventory (10 erreurs)
# PR #5 : Module Accounting (10 erreurs)
# PR #6 : Reste (19 erreurs)
```

**Checklist par PR** :
- [ ] Identifier module (10 erreurs max)
- [ ] Fixer erreurs
- [ ] Tests manuels module
- [ ] Type-check module OK
- [ ] Build global OK
- [ ] Review & merge
- [ ] Sync refacto avec main

---

## 🗄️ PHASE 3 : Clean Database (3 jours, 1 PR)

### PR #7 : Execute DB Migration (3 jours)

**Jour 1 : Préparation**

```bash
# 1. Backup production
# Via MongoDB Atlas UI

# 2. Test migration dev
pnpm migrate:db:dry-run  # Preview
pnpm migrate:db          # Execute dev

# 3. Test app dev avec nouvelles collections
pnpm dev
# → Tester toutes features inventory
```

**Jour 2 : Validation**

```bash
# 1. Vérifier toutes features inventory fonctionnent
# 2. Vérifier MongoDB Compass (collections renommées)
# 3. Vérifier logs (pas d'erreurs)
```

**Jour 3 : Production**

```bash
# 1. Merge PR (models mis à jour)
# 2. Deploy Vercel (avec nouveaux models)
# 3. Exécuter migration production (période basse activité)
pnpm migrate:db

# 4. Vérifier app production
# 5. Rollback si problème
```

**Checklist** :
- [ ] Backup production
- [ ] Test migration dev
- [ ] Test app dev
- [ ] Merge PR
- [ ] Deploy Vercel
- [ ] Execute migration prod
- [ ] Test app prod
- [ ] Monitoring 24h

---

## 🧹 PHASE 4 : Refacto App (10 jours, 4 PRs)

### PR #8 : Refacto Fichiers > 200 Lignes (3 jours)

**Fichiers à refactoriser** :

```
confidentiality/page.tsx (881 lignes) → Extraire sections
cgu/page.tsx (806 lignes) → Extraire sections
ReservationsTabs.tsx (642 lignes) → Extraire tabs
orders/new/page.tsx (612 lignes) → Extraire form sections
useBookingForm.ts (562 lignes) → Split hooks
Step4Administrative.tsx (563 lignes) → Extraire fields
```

**Pattern refacto** :

```bash
# Exemple : ReservationsTabs.tsx (642 lignes)

# AVANT
src/components/ReservationsTabs.tsx (642 lignes)

# APRÈS
src/components/reservations/
├── index.ts (barrel exports)
├── ReservationsTabs.tsx (100 lignes - orchestration)
├── PendingTab.tsx (150 lignes)
├── ConfirmedTab.tsx (150 lignes)
├── CancelledTab.tsx (150 lignes)
└── types.ts (interfaces)
```

**Checklist** :
- [ ] Identifier 6+ fichiers > 200 lignes
- [ ] Refacto 1 fichier/jour
- [ ] Tests manuels après chaque refacto
- [ ] Review & merge

---

### PR #9-11 : Autres Refactos App (7 jours)

```
PR #9 : Consolidate duplicate types (2 jours)
PR #10 : Extract hooks from components (3 jours)
PR #11 : SCSS cleanup & BEM consistency (2 jours)
```

**Checklist** :
- [ ] Voir détails dans chaque PR

---

## 🛡️ PHASE 5 : Enforcement (3 jours, 3 PRs)

### PR #12 : Remove ignoreBuildErrors (1h)

```bash
# Modifier next.config.js (both apps)
# Retirer ignoreBuildErrors: true

# CRITICAL: Doit être fait APRÈS toutes erreurs fixées
pnpm type-check  # Doit passer
pnpm build       # Doit réussir
```

**Checklist** :
- [ ] Retirer ignoreBuildErrors
- [ ] Type-check passe
- [ ] Build réussit
- [ ] Review & merge

---

### PR #13 : Pre-commit Hooks (1 jour)

```bash
pnpm add -D husky lint-staged

# Setup hooks (mode permissif d'abord)
# .husky/pre-commit (warnings, pas de blocage)

# Tester
git commit -m "test: pre-commit hooks"
```

**Checklist** :
- [ ] Setup Husky
- [ ] Config lint-staged
- [ ] Mode permissif (warnings)
- [ ] Tester hooks
- [ ] Review & merge
- [ ] Après 1 semaine → mode strict

---

### PR #14 : ESLint Rules Custom (2 jours)

```bash
# Créer .eslintrc.custom.js
# Rules: no-any, no-new-date, max-lines

# Mode WARNING d'abord
# Après 2 semaines → mode ERROR
```

**Checklist** :
- [ ] Créer ESLint config custom
- [ ] Mode warn
- [ ] Tester dev
- [ ] Review & merge
- [ ] Après 2 semaines → mode error

---

## ✅ PHASE 6 : Tests (10 jours, optionnel)

### Setup Tests Automatisés

```bash
# Unit tests (Jest/Vitest)
pnpm add -D vitest @testing-library/react

# E2E tests (Playwright)
pnpm add -D @playwright/test
```

**Target** : 50% coverage logique métier

**Checklist** :
- [ ] Setup Jest/Vitest
- [ ] Tests utils/helpers
- [ ] Tests hooks
- [ ] Tests composants critiques
- [ ] Setup Playwright
- [ ] Tests E2E workflows critiques

---

## 📋 Checklist Globale

### Préparation
- [ ] Phase 0.1 : Restructuration docs (PR #0.1)
- [ ] Phase 0.2 : Plan migration DB (PR #0.2)

### Audit
- [ ] Phase 1 : Scripts validation (PR #1)

### Clean Code
- [ ] Phase 2.1 : Fix TS site (PR #2)
- [ ] Phase 2.2 : Fix TS admin (PR #3-6)

### Clean DB
- [ ] Phase 3 : Migration collections (PR #7)

### Clean App
- [ ] Phase 4.1 : Refacto files (PR #8)
- [ ] Phase 4.2 : Consolidate types (PR #9)
- [ ] Phase 4.3 : Extract hooks (PR #10)
- [ ] Phase 4.4 : SCSS cleanup (PR #11)

### Enforcement
- [ ] Phase 5.1 : Remove ignoreBuildErrors (PR #12)
- [ ] Phase 5.2 : Pre-commit hooks (PR #13)
- [ ] Phase 5.3 : ESLint rules (PR #14)

### Tests (optionnel)
- [ ] Phase 6 : Tests automatisés

---

## 🚨 Gestion Features Urgentes Pendant Refacto

### Si Feature INDÉPENDANTE du Refacto

```bash
# Créer depuis main (PAS refacto)
git checkout main
git checkout -b feature/urgent-fix

# Dev feature
# ...

# Merge direct dans main
git checkout main
git merge feature/urgent-fix

# Sync refacto
git checkout refacto/automation
git rebase main  # Récupère feature
```

### Si Feature DÉPENDANTE du Refacto

```bash
# Créer depuis refacto
git checkout refacto/automation
git checkout -b feature/depends-refacto

# Dev feature
# ...

# Merge dans refacto
git checkout refacto/automation
git merge feature/depends-refacto

# Continuera avec refacto vers main
```

---

## 📊 Métriques de Suivi

| Métrique | Baseline | Phase 2 | Phase 3 | Phase 4 | Target |
|----------|----------|---------|---------|---------|--------|
| **TS Errors** | 55 | 0 | 0 | 0 | 0 |
| **Files > 200L** | 6+ | 6+ | 6+ | 0 | 0 |
| **new Date()** | 15+ | 15+ | 15+ | 5- | 0 |
| **Collections** | Inconsistant | Inconsistant | Cohérent | Cohérent | Cohérent |
| **CLAUDE.md** | 500+L | 500+L | 500+L | 150L | 150L |
| **Test Coverage** | 0% | 0% | 0% | 0% | 50%+ |

---

## 🎯 Commandes Rapides

```bash
# Audit état actuel
pnpm audit:all

# Sync refacto avec main (quotidien)
git checkout refacto/automation && git pull origin main --rebase

# Nouvelle PR
gh pr create --base main --head refacto/automation --title "..."

# Dry-run migration DB
pnpm migrate:db:dry-run

# Execute migration DB
pnpm migrate:db
```

---

## 📝 Notes

- **Backup DB** avant TOUTE migration
- **Tests manuels** STRICTS après chaque PR
- **Sync quotidien** refacto avec main
- **Review obligatoire** (1+ approval) sur toutes PRs
- **CI/CD** doit passer avant merge
- **Communication** équipe sur features urgentes

---

**Dernière mise à jour** : 2026-03-11
**Auteur** : Thierry + Claude
**Status** : 📋 Ready to start (après feature urgente)
