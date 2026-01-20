# Guide de Migration

> Comment migrer un module de apps/site vers apps/admin.
> **Derniere mise a jour** : 2026-01-20

---

## Philosophie

**Ce n'est PAS un copier-coller !**

La migration est une **REECRITURE COMPLETE** avec les bonnes pratiques.

```
MAUVAISE APPROCHE              BONNE APPROCHE
1. Copier le code             1. ANALYSER le code source
2. Coller dans admin          2. COMPRENDRE la logique metier
3. Ajuster les imports        3. IDENTIFIER les problemes
                              4. REECRIRE proprement
                              5. RESPECTER les conventions
```

---

## Workflow de Migration

### 1. Analyse (30 min)

```bash
# Lister les fichiers du module
ls -la apps/site/src/app/dashboard/[module]/

# Identifier :
# - Pages
# - Composants
# - APIs
# - Types
# - Dependances
```

### 2. Types (1h)

Creer les types dans `/types/[module].ts` :

```typescript
export interface MonType {
  id: string;
  date: string;    // YYYY-MM-DD (pas Date!)
  // ...
}
```

### 3. Models Mongoose (1-2h)

```bash
mkdir -p src/models/[module]
touch src/models/[module]/{index,document,methods,hooks,virtuals}.ts
```

### 4. API Routes (2-3h)

```bash
mkdir -p src/app/api/[module]
touch src/app/api/[module]/route.ts
touch src/app/api/[module]/[id]/route.ts
```

Toujours utiliser `requireAuth()` !

### 5. Composants (3-4h)

- Fichiers < 200 lignes
- Extraire hooks si > 100 lignes
- Utiliser shadcn/ui
- Zero `any` types

### 6. Tests

- Suivre TESTING_CHECKLIST.md
- Verifier console navigateur
- Build : `pnpm build`

---

## Checklist Migration

- [ ] Analyse complete du module source
- [ ] Types crees dans `/types/`
- [ ] Models Mongoose (structure modulaire)
- [ ] API routes avec requireAuth()
- [ ] Composants < 200 lignes
- [ ] Hooks custom pour logique
- [ ] Pages Next.js < 150 lignes
- [ ] Zero `any` types
- [ ] Dates en format string
- [ ] Tests manuels passes
- [ ] Build reussi
- [ ] Documentation mise a jour

---

## Voir Aussi

- [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) - Status par module
- [CLAUDE.md](/apps/admin/CLAUDE.md) - Section migration detaillee

---

*Temps estime par module : 1-2 jours*
