# Tests End-to-End (E2E)

> Guide pour les tests E2E avec Playwright.
> **Derniere mise a jour** : 2026-01-20

---

## Status

**Non implemente** - Cette documentation est un placeholder pour l'implementation future.

---

## Plan d'Implementation

### 1. Installation

```bash
pnpm add -D @playwright/test
npx playwright install
```

### 2. Configuration

Creer `playwright.config.ts` :

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3001',
  use: {
    trace: 'on-first-retry',
  },
});
```

### 3. Tests Critiques a Implementer

| Test | Priorite | Description |
|------|----------|-------------|
| Auth flow | Haute | Login/logout |
| Employee CRUD | Haute | Creation/modification employe |
| Time entry | Haute | Pointage entree/sortie |
| Cash control | Moyenne | Entrees de caisse |
| PDF generation | Moyenne | Export PDF |

### 4. Structure des Tests

```
/tests/e2e/
├── auth.spec.ts
├── employees.spec.ts
├── time-entries.spec.ts
├── cash-control.spec.ts
└── fixtures/
    └── test-data.ts
```

---

## Commandes

```bash
# Executer tous les tests
pnpm test:e2e

# Mode interactif
pnpm test:e2e --ui

# Un seul fichier
pnpm test:e2e auth.spec.ts
```

---

## Voir Aussi

- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Tests manuels
- [Playwright Docs](https://playwright.dev/)

---

*TODO: Implementer les tests E2E*
