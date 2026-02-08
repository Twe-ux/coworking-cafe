# Guide des Tests

Guide pour tester l'application admin.

## 🧪 Tests Manuels (OBLIGATOIRE)

**Avant chaque commit important**, suivre cette checklist.

### Checklist Rapide (5 min)

```bash
# 1. Lancer le serveur
pnpm dev

# 2. Tests basiques
✓ Login réussi
✓ Navigation dans le nouveau module
✓ Créer un élément
✓ Modifier un élément
✓ Supprimer un élément
✓ Console (F12) - pas d'erreurs
✓ Données sauvées en BD
```

---

## 📋 Checklist Complète par Module

Voir le fichier `/TESTING_CHECKLIST.md` à la racine de l'app admin.

**Modules disponibles** :
- HR (Employés, Planning, Disponibilités)
- Pointage (Clock in/out, Shifts)
- Comptabilité (Caisse, CA)
- Dashboard

---

## 🔍 Vérifications Techniques

### 1. TypeScript

```bash
# Vérifier aucune erreur TypeScript
pnpm exec tsc --noEmit

# ✅ Output attendu :
# (pas de sortie = succès)
```

### 2. Build

```bash
# Vérifier que le build passe
pnpm build

# ✅ Output attendu :
# Route (app)                  Size     First Load JS
# ○ /                          XXX kB         XXX kB
# ...
# ✓ Compiled successfully
```

### 3. Console Browser

**F12 → Console**

```
✅ Aucune erreur rouge
⚠️ Warnings acceptables :
   - Mongoose exports warning (connu)
   - Next.js dev warnings

❌ Erreurs à corriger :
   - API 500 errors
   - Type errors
   - Hydration errors
   - Unhandled promise rejections
```

---

## 🎯 Tests par Feature

### Auth & Permissions

```
✓ Login avec credentials valides
✓ Login refusé avec credentials invalides
✓ Logout fonctionne
✓ Routes protégées redirigent si non auth
✓ Permissions respectées (dev/admin/staff)
✓ Session persiste au refresh
```

### CRUD Operations

```
✓ Create - Validation inputs
✓ Create - Succès avec données valides
✓ Read - Liste affichée correctement
✓ Read - Filtres fonctionnent
✓ Update - Modification sauvée
✓ Delete - Suppression confirmée
✓ Delete - Confirmation demandée avant suppression
```

### UI/UX

```
✓ Skeleton loader affiché pendant chargement
✓ Messages d'erreur clairs
✓ Messages de succès affichés
✓ Responsive (mobile, tablet, desktop)
✓ Navigation sidebar fonctionne
✓ Boutons désactivés pendant opérations
```

### Performance

```
✓ Chargement page < 3s
✓ Pas de re-renders inutiles (React DevTools)
✓ Pas de memory leaks (ouvrir 10x la page, RAM stable)
✓ Images optimisées
```

---

## 🔄 Tests d'Intégration

### Scénarios Complets

#### Scénario 1 : Onboarding Employé

```
1. Login admin
2. HR → Employés → Ajouter
3. Remplir formulaire + PIN
4. Sauvegarder
5. Vérifier liste employés
6. Vérifier disponibilités (page dédiée)
7. Modifier disponibilités
8. Vérifier sauvegarde
```

#### Scénario 2 : Gestion Pointage

```
1. Employé clock-in (avec PIN)
2. Vérifier entrée créée
3. Admin consulte pointages
4. Admin modifie pointage
5. Employé clock-out
6. Vérifier heures calculées
```

#### Scénario 3 : Clôture Caisse

```
1. Login admin
2. Comptabilité → Caisse
3. Ajouter ouverture caisse
4. Ajouter clôture caisse
5. Vérifier différence affichée
6. Générer PDF
7. Vérifier PDF téléchargé
```

---

## 🐛 Debugging

### Logs Utiles

```typescript
// API Routes
console.log('[Route] Data received:', data)
console.error('[Route] Error:', error)

// Components
console.log('[Component] State updated:', newState)
console.log('[Component] Props:', props)

// Hooks
console.log('[Hook] Fetching data...')
console.log('[Hook] Data loaded:', data)
```

### React DevTools

```
1. Installer extension React DevTools
2. Ouvrir DevTools → Components
3. Vérifier props passées
4. Vérifier state interne
5. Voir les re-renders (⚙️ → Highlight updates)
```

### Network Tab

```
1. F12 → Network
2. Filter: Fetch/XHR
3. Vérifier requêtes API
4. Vérifier status codes (200, 201, 400, etc.)
5. Vérifier payloads (request/response)
```

---

## ✅ Checklist Avant Commit

```bash
# 1. Types
pnpm exec tsc --noEmit

# 2. Build
pnpm build

# 3. Tests manuels
# - Login OK
# - Feature testée OK
# - Console propre
# - BD mise à jour

# 4. Git
git status
git diff
git add .
git commit -m "feat(admin): add [feature]"
```

---

## 🚀 Tests Automatisés (TODO)

### E2E avec Playwright

```bash
# Installation
pnpm add -D @playwright/test

# Configuration
npx playwright install

# Tests
pnpm test:e2e
```

**Exemple de test E2E** :

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  await page.fill('input[name="email"]', 'admin@coworking.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('http://localhost:3000/')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

---

## 📊 Métriques Qualité

### Objectifs

- ✅ **Type Safety** : 0 `any` types
- ✅ **Build** : 0 erreurs
- ✅ **Console** : 0 erreurs runtime
- ✅ **Performance** : < 3s First Load
- ⚠️ **Tests E2E** : À mettre en place
- ⚠️ **Coverage** : À mettre en place

---

**Voir aussi** :
- `/TESTING_CHECKLIST.md` - Checklist détaillée par module
- [CONVENTIONS.md](./CONVENTIONS.md) - Standards de code
