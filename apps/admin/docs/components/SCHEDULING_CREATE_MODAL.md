# CreateEmployeeModal - Structure Modulaire

Ce dossier contient la version refactorisée du composant `CreateEmployeeModal.tsx` (anciennement 477 lignes).

## Structure

```
create-modal/
├── README.md                        # Documentation
├── index.ts                         # Exports publics
├── types.ts                         # Types TypeScript (21 lignes)
├── constants.ts                     # Constantes (30 lignes)
├── validation.ts                    # Logique de validation (63 lignes)
├── useEmployeeCreate.ts             # Hook principal (105 lignes)
├── CreateEmployeeModal.tsx          # Composant orchestrateur (101 lignes)
├── PersonalInfoSection.tsx          # Section infos personnelles (115 lignes)
├── ProfessionalInfoSection.tsx      # Section infos professionnelles (86 lignes)
└── AppearanceSection.tsx            # Section apparence/couleur (62 lignes)
```

**Total**: 587 lignes réparties en 9 fichiers (vs 477 lignes en 1 fichier)

## Avantages de la Refactorisation

### Avant (477 lignes)
- Tout dans un seul fichier
- Logique mélangée avec UI
- Difficile à maintenir
- Difficile à tester

### Après (9 fichiers modulaires)
- Séparation des responsabilités
- Fichiers < 200 lignes (✅ convention respectée)
- Composants réutilisables
- Logique testable isolée
- Zero `any` types (✅ strict mode)

## Utilisation

### Import Standard (Rétrocompatible)

```typescript
// Fonctionne toujours comme avant
import CreateEmployeeModal from '@/components/employee-scheduling/CreateEmployeeModal'

function EmployeeList() {
  return (
    <CreateEmployeeModal
      isOpen={isOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}
```

### Import depuis le Dossier Modulaire

```typescript
// Import depuis le dossier create-modal
import { CreateEmployeeModal } from '@/components/employee-scheduling/create-modal'

// Import des types
import type { EmployeeFormData, FormErrors } from '@/components/employee-scheduling/create-modal'

// Import des constantes
import { EMPLOYEE_ROLES, EMPLOYEE_COLORS } from '@/components/employee-scheduling/create-modal'
```

## Responsabilités par Fichier

### types.ts
- `EmployeeFormData` - Données du formulaire
- `FormErrors` - Erreurs de validation
- `ServerError` - Réponse API

### constants.ts
- `EMPLOYEE_ROLES` - Rôles disponibles (Manager, etc.)
- `EMPLOYEE_COLORS` - Couleurs pour le planning

### validation.ts
- `validateEmployeeForm()` - Validation côté client
- `parseServerErrors()` - Parse les erreurs serveur

### useEmployeeCreate.ts
Hook principal gérant:
- État du formulaire (`formData`)
- État de chargement (`isLoading`)
- Erreurs (`errors`)
- Handlers (`handleInputChange`, `handleSubmit`, `handleClose`)
- Appel API (`POST /api/hr/employees`)

### CreateEmployeeModal.tsx
Composant orchestrateur:
- Gère le Dialog
- Utilise `useEmployeeCreate()`
- Compose les 3 sections
- Gère le footer (boutons)

### PersonalInfoSection.tsx
Section "Informations personnelles":
- Prénom, Nom
- Email, Téléphone
- Code PIN

### ProfessionalInfoSection.tsx
Section "Informations professionnelles":
- Rôle (select)
- Date de début

### AppearanceSection.tsx
Section "Couleur d'identification":
- Sélection de couleur
- Aperçu du badge

## Conventions Respectées

- ✅ Fichiers < 200 lignes (max: 115 lignes)
- ✅ Zero `any` types
- ✅ Types importés de `./types.ts`
- ✅ Composants réutilisables
- ✅ Logique séparée (hook)
- ✅ Validation isolée
- ✅ Constantes centralisées

## Tests

Pour tester la compilation:
```bash
cd apps/admin
npx tsc --noEmit
```

Pour tester visuellement:
```bash
pnpm dev
# Naviguer vers /hr/employees
# Cliquer sur "Ajouter un employé"
```

## Maintenance

### Ajouter un Nouveau Champ

1. **types.ts** - Ajouter le champ dans `EmployeeFormData`
2. **useEmployeeCreate.ts** - Initialiser dans `useState`
3. **validation.ts** - Ajouter validation si nécessaire
4. **PersonalInfoSection.tsx** ou **ProfessionalInfoSection.tsx** - Ajouter l'input

### Ajouter une Nouvelle Couleur

1. **constants.ts** - Ajouter dans `EMPLOYEE_COLORS`

### Modifier la Validation

1. **validation.ts** - Modifier `validateEmployeeForm()`

## Migration depuis l'Ancien Fichier

L'ancien fichier `/components/employee-scheduling/CreateEmployeeModal.tsx` est maintenant un simple re-export:

```typescript
export { default } from './create-modal'
export { CreateEmployeeModal } from './create-modal'
export * from './create-modal/types'
export * from './create-modal/constants'
```

Cela garantit la compatibilité avec les imports existants dans le codebase.
