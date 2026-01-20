# EditEmployeeModal - Architecture Modulaire

Ce dossier contient le composant EditEmployeeModal refactorisé en modules réutilisables.

## Structure

```
edit-modal/
├── index.ts                      # Exports publics
├── types.ts                      # Types TypeScript
├── constants.ts                  # Constantes (rôles, couleurs)
├── useEmployeeEdit.ts           # Hook de logique métier
├── EditEmployeeModal.tsx        # Composant principal (124 lignes)
├── PersonalInfoSection.tsx      # Section informations personnelles (60 lignes)
├── ContactSection.tsx           # Section contact + PIN (82 lignes)
├── RoleAndAppearanceSection.tsx # Section rôle et couleur (114 lignes)
└── StartDateSection.tsx         # Section date de début (42 lignes)
```

## Utilisation

### Import standard

```typescript
import EditEmployeeModal from '@/components/employee-scheduling/EditEmployeeModal'
// ou
import EditEmployeeModal from '@/components/employee-scheduling/edit-modal'

<EditEmployeeModal
  employee={selectedEmployee}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={(updatedEmployee) => {
    console.log('Employee updated:', updatedEmployee)
    refreshEmployeeList()
  }}
/>
```

### Import des types

```typescript
import type { EmployeeFormData, EmployeeFormErrors } from '@/components/employee-scheduling/edit-modal'
```

### Import des constantes

```typescript
import { EMPLOYEE_ROLES, EMPLOYEE_COLORS } from '@/components/employee-scheduling/edit-modal'
```

## Composants

### EditEmployeeModal (principal)

Composant modal qui orchestre les sections du formulaire.

**Props:**
- `employee: Employee | null` - Employé à modifier
- `isOpen: boolean` - État du modal
- `onClose: () => void` - Callback de fermeture
- `onSuccess: (employee: Employee) => void` - Callback succès

### PersonalInfoSection

Section pour le prénom et nom de l'employé.

**Props:**
- `formData: EmployeeFormData`
- `errors: EmployeeFormErrors`
- `onChange: (field, value) => void`

### ContactSection

Section pour email, téléphone et code PIN.

**Props:**
- `formData: EmployeeFormData`
- `errors: EmployeeFormErrors`
- `onChange: (field, value) => void`

### RoleAndAppearanceSection

Section pour le rôle et la couleur d'affichage.

**Props:**
- `formData: EmployeeFormData`
- `errors: EmployeeFormErrors`
- `onChange: (field, value) => void`

### StartDateSection

Section pour la date de début de l'employé.

**Props:**
- `formData: EmployeeFormData`
- `errors: EmployeeFormErrors`
- `onChange: (field, value) => void`

## Hook useEmployeeEdit

Hook custom qui gère toute la logique métier du formulaire.

**Paramètres:**
```typescript
{
  employee: Employee | null
  isOpen: boolean
  onSuccess: (employee: Employee) => void
  onClose: () => void
}
```

**Retour:**
```typescript
{
  formData: EmployeeFormData
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>
  errors: EmployeeFormErrors
  isLoading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleClose: () => void
}
```

**Responsabilités:**
- Initialisation du formulaire avec les données de l'employé
- Validation des champs (email, phone, PIN)
- Soumission à l'API PUT `/api/hr/employees/:id`
- Gestion des erreurs (conflits email, erreurs serveur)
- Reset du formulaire à la fermeture

## Validation

### Champs requis
- `firstName` (prénom)
- `lastName` (nom)
- `role` (rôle)
- `startDate` (date de début)
- `pin` (code PIN 4 chiffres)

### Champs optionnels
- `email` (validé si renseigné)
- `phone` (validé si renseigné)
- `color` (par défaut: bg-blue-500)

### Règles de validation
- **Email:** Format standard (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **Phone:** Format français (`/^(\+33|0)[1-9](\d{8})$/`)
- **PIN:** Exactement 4 chiffres (`/^\d{4}$/`)
- **StartDate:** Ne peut pas être dans le futur

## API

### Endpoint utilisé

```
PUT /api/hr/employees/:id
```

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "01 23 45 67 89",
  "role": "Manager",
  "color": "bg-blue-500",
  "startDate": "2024-01-15",
  "pin": "1234"
}
```

**Réponses:**
- `200`: Succès (retourne l'employé mis à jour)
- `409`: Conflit (email déjà utilisé)
- `400`: Validation échouée
- `500`: Erreur serveur

## Conventions respectées

- ✅ Tous les fichiers < 200 lignes
- ✅ Zero types `any`
- ✅ Types explicites partout
- ✅ Composants réutilisables
- ✅ Logique métier dans un hook
- ✅ Séparation des responsabilités
- ✅ Gestion d'erreurs complète

## Évolutions futures possibles

### Court terme
- Extraire validation dans `validation.ts`
- Partager le hook avec CreateEmployeeModal

### Moyen terme
- Tests unitaires pour useEmployeeEdit
- Tests d'intégration pour les sections
- Storybook pour les composants

### Long terme
- Support multi-langue (i18n)
- Validation asynchrone (email unique en temps réel)
- Mode brouillon (sauvegarde locale)
