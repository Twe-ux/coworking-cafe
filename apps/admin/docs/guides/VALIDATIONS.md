# Validation Zod - Documentation

Ce dossier contient tous les schémas de validation Zod pour les routes API critiques.

## Pourquoi Zod ?

- Validation typée des données entrantes
- Messages d'erreur clairs et personnalisables
- Protection contre les injections et données malformées
- Types TypeScript automatiquement générés

## Structure

```
/lib/validations/
├── employee.ts      # Schémas pour Employee
├── timeEntry.ts     # Schémas pour TimeEntry
├── cashEntry.ts     # Schémas pour CashEntry
├── shift.ts         # Schémas pour Shift
├── index.ts         # Exports centralisés
└── README.md        # Ce fichier
```

## Utilisation dans une Route API

### Exemple : POST /api/hr/employees

```typescript
import { parseAndValidate } from '@/lib/api/validation'
import { createEmployeeSchema } from '@/lib/validations/employee'

export async function POST(request: NextRequest) {
  // 1. Validation avec Zod
  const validation = await parseAndValidate(request, createEmployeeSchema)
  if (!validation.success) {
    return validation.response // Retourne erreur 400 avec détails
  }

  // 2. Données validées et typées
  const data = validation.data // Type: CreateEmployeeInput

  // 3. Utiliser les données validées
  const employee = await Employee.create(data)
  return NextResponse.json({ success: true, data: employee })
}
```

### Avec des Données JSON Déjà Parsées

```typescript
import { validateRequest } from '@/lib/api/validation'
import { clockInSchema } from '@/lib/validations/timeEntry'

export async function POST(request: NextRequest) {
  const rawBody = await request.json()

  // Validation
  const validation = validateRequest(rawBody, clockInSchema)
  if (!validation.success) {
    return validation.response
  }

  const body = validation.data
  // ...
}
```

## Schémas Disponibles

### Employee (employee.ts)

- **createEmployeeSchema** : Création d'employé (tous les champs requis)
- **updateEmployeeSchema** : Mise à jour (tous les champs optionnels)
- **endContractSchema** : Fin de contrat

```typescript
import { createEmployeeSchema, type CreateEmployeeInput } from '@/lib/validations/employee'
```

### TimeEntry (timeEntry.ts)

- **clockInSchema** : Pointage entrée
- **clockOutSchema** : Pointage sortie
- **createTimeEntrySchema** : Création manuelle (admin)
- **updateTimeEntrySchema** : Mise à jour

```typescript
import { clockInSchema, type ClockInInput } from '@/lib/validations/timeEntry'
```

### CashEntry (cashEntry.ts)

- **createCashEntrySchema** : Création entrée caisse
- **updateCashEntrySchema** : Mise à jour

```typescript
import { createCashEntrySchema, type CreateCashEntryInput } from '@/lib/validations/cashEntry'
```

### Shift (shift.ts)

- **createShiftSchema** : Création d'un shift
- **updateShiftSchema** : Mise à jour
- **bulkCreateShiftsSchema** : Création en masse

```typescript
import { createShiftSchema, type CreateShiftInput } from '@/lib/validations/shift'
```

## Format de Réponse d'Erreur

Quand la validation échoue, la réponse automatique est :

```json
{
  "success": false,
  "error": "Données invalides",
  "details": [
    "firstName: Le prénom doit contenir au moins 2 caractères",
    "email: Veuillez fournir une adresse email valide"
  ]
}
```

Status HTTP : **400 Bad Request**

## Créer un Nouveau Schéma

### 1. Créer le Fichier

```bash
touch src/lib/validations/monModule.ts
```

### 2. Définir le Schéma

```typescript
import { z } from 'zod'

export const createMonModuleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  age: z.number().min(18, 'Doit avoir au moins 18 ans'),
})

export const updateMonModuleSchema = createMonModuleSchema.partial()

export type CreateMonModuleInput = z.infer<typeof createMonModuleSchema>
export type UpdateMonModuleInput = z.infer<typeof updateMonModuleSchema>
```

### 3. Exporter dans index.ts

```typescript
// lib/validations/index.ts
export * from './monModule'
```

### 4. Utiliser dans une Route

```typescript
import { parseAndValidate } from '@/lib/api/validation'
import { createMonModuleSchema } from '@/lib/validations/monModule'

export async function POST(request: NextRequest) {
  const validation = await parseAndValidate(request, createMonModuleSchema)
  if (!validation.success) {
    return validation.response
  }

  const data = validation.data
  // ...
}
```

## Validations Personnalisées

### Validation de Format de Date

```typescript
date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD')
```

### Validation de Format d'Heure

```typescript
time: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure doit être au format HH:mm')
```

### Validation Conditionnelle

```typescript
z.object({
  clockIn: z.string(),
  clockOut: z.string().optional(),
}).refine(
  (data) => {
    if (!data.clockOut) return true
    return data.clockOut !== data.clockIn
  },
  {
    message: 'L\'heure de sortie doit être différente de l\'heure d\'entrée',
    path: ['clockOut'],
  }
)
```

### Validation d'Âge

```typescript
dateOfBirth: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 16 && age <= 100
    },
    'L\'employé doit avoir entre 16 et 100 ans'
  )
```

## Bonnes Pratiques

### 1. Messages d'Erreur Clairs

```typescript
// ❌ MAUVAIS
z.string().min(2)

// ✅ BON
z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
```

### 2. Utiliser .trim() pour les Strings

```typescript
// ✅ BON
firstName: z.string().min(2).trim()
```

### 3. Utiliser .partial() pour Updates

```typescript
// Création : tous les champs requis
export const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// Update : tous les champs optionnels
export const updateSchema = createSchema.partial()
```

### 4. Typage avec z.infer

```typescript
export type CreateInput = z.infer<typeof createSchema>
export type UpdateInput = z.infer<typeof updateSchema>
```

### 5. Validation Before Business Logic

```typescript
export async function POST(request: NextRequest) {
  // 1. Auth (si nécessaire)
  const authResult = await requireAuth(['admin'])
  if (!authResult.authorized) return authResult.response

  // 2. Validation (avant toute logique)
  const validation = await parseAndValidate(request, schema)
  if (!validation.success) return validation.response

  // 3. Business logic
  const data = validation.data
  // ...
}
```

## Routes Validées

### Actuellement Validées

- ✅ POST /api/hr/employees (createEmployeeSchema)
- ✅ POST /api/time-entries/clock-in (clockInSchema)
- ✅ POST /api/time-entries/clock-out (clockOutSchema)
- ✅ POST /api/accounting/cash-entries (createCashEntrySchema)

### À Valider

- [ ] PUT /api/hr/employees/[id]
- [ ] POST /api/shifts
- [ ] PUT /api/shifts/[id]
- [ ] POST /api/time-entries (admin manual)
- [ ] PUT /api/time-entries/[id]
- [ ] PUT /api/accounting/cash-entries/[id]

## Debugging

### Voir les Erreurs de Validation

```typescript
const validation = await parseAndValidate(request, schema)
if (!validation.success) {
  // La réponse contient les erreurs détaillées
  console.log(validation.response)
  return validation.response
}
```

### Tester un Schéma

```typescript
import { createEmployeeSchema } from '@/lib/validations/employee'

const result = createEmployeeSchema.safeParse({
  firstName: 'John',
  // ... autres champs
})

if (!result.success) {
  console.log(result.error.issues)
}
```

## Ressources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [CLAUDE.md - Conventions Admin](/apps/admin/CLAUDE.md)

---

Dernière mise à jour : 2026-01-21
