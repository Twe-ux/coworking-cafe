# Guide des Types Partagés

Guide pour utiliser et créer des types TypeScript partagés.

## 📦 Single Source of Truth

**RÈGLE** : Toujours importer depuis `/types/` plutôt que redéfinir localement.

```typescript
// ❌ INTERDIT - Interface locale dupliquée
interface Employee {
  id: string
  firstName: string
  lastName: string
}

// ✅ CORRECT - Import depuis types partagés
import type { Employee } from '@/types/hr'
```

---

## 📁 Types Principaux Disponibles

### `/types/hr.ts` - Ressources Humaines

```typescript
// Employé complet
interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeRole?: 'Manager' | 'Assistant manager' | 'Employé polyvalent'
  contractType?: 'CDI' | 'CDD' | 'Stage' | 'Alternance'
  pin?: string
  isActive: boolean
  onboardingCompleted: boolean
  createdAt?: string
  updatedAt?: string
}

// Formulaire création/édition
interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeRole: string
  contractType: string
}

// Créneau de travail
interface Shift {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  shiftNumber: 1 | 2
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: 'scheduled' | 'completed' | 'cancelled'
}

// Disponibilités
interface AvailabilityDay {
  morning: boolean
  afternoon: boolean
}

interface WeeklyAvailability {
  monday: AvailabilityDay
  tuesday: AvailabilityDay
  wednesday: AvailabilityDay
  thursday: AvailabilityDay
  friday: AvailabilityDay
  saturday: AvailabilityDay
  sunday: AvailabilityDay
}
```

### `/types/timeEntry.ts` - Pointage

```typescript
// Entrée de pointage
interface TimeEntry {
  id: string
  employeeId: string
  date: string        // YYYY-MM-DD
  clockIn: string     // HH:mm
  clockOut?: string   // HH:mm | null
  shiftNumber: 1 | 2
  status: 'active' | 'completed'
  createdAt?: string
  updatedAt?: string
}

// Filtres recherche
interface TimeEntryFilter {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: 'active' | 'completed' | 'all'
}

// Mise à jour
interface TimeEntryUpdate {
  clockIn?: string
  clockOut?: string
  status?: 'active' | 'completed'
}

// Rapport d'heures
interface EmployeeTimeReport {
  employeeId: string
  employeeName: string
  totalHours: number
  entries: TimeEntry[]
}

// Réponse API standardisée
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### `/types/accounting.ts` - Comptabilité

```typescript
// Entrée de caisse
interface CashEntry {
  id: string
  date: string // YYYY-MM-DD
  type: 'opening' | 'closing'
  amount: number
  notes?: string
  createdBy: string
  createdAt?: string
}

// Ligne de caisse (pour tableau)
interface CashEntryRow {
  id: string
  date: string
  opening: number
  closing: number
  difference: number
  notes: string
}

// Données CA
interface TurnoverData {
  date: string // YYYY-MM-DD
  amount: number
  bookingsCount: number
}

// Données pour PDF
interface CashControlPDF {
  date: string
  opening: number
  closing: number
  difference: number
  entries: CashEntry[]
}
```

---

## 🆕 Créer un Nouveau Type

### Étapes

```typescript
// 1. Créer le fichier dans /types/
// /types/monModule.ts
export interface MonNouveauType {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt?: string
}

// 2. Exporter dans index (optionnel)
// /types/index.ts
export * from './monModule'
export * from './hr'
export * from './timeEntry'

// 3. Utiliser partout
import type { MonNouveauType } from '@/types/monModule'
```

---

## 🔀 Patterns de Types Utiles

### 1. Extend / Omit / Pick

```typescript
// Extend - Ajouter des champs
interface EmployeeWithStats extends Employee {
  totalHours: number
  shiftsCount: number
}

// Omit - Retirer des champs
type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>

// Pick - Garder seulement certains champs
type EmployeeBasicInfo = Pick<Employee, 'id' | 'firstName' | 'lastName'>
```

### 2. Partial / Required

```typescript
// Partial - Tous les champs optionnels
type EmployeeUpdate = Partial<Employee>

// Required - Tous les champs obligatoires
type EmployeeRequired = Required<Employee>
```

### 3. Union Types

```typescript
// États possibles
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Types de rôles
type EmployeeRole = 'Manager' | 'Assistant manager' | 'Employé polyvalent'
```

### 4. Générics

```typescript
// Réponse API générique
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Usage
const response: ApiResponse<Employee[]> = await fetch(...)
const single: ApiResponse<Employee> = await fetch(...)
```

---

## 📋 Conventions de Nommage

### Interfaces vs Types

```typescript
// ✅ BON - Interfaces pour objets
interface Employee {
  id: string
  name: string
}

// ✅ BON - Types pour unions, primitives
type EmployeeStatus = 'active' | 'inactive'
type EmployeeRole = 'Manager' | 'Staff'

// ✅ BON - Types pour utilitaires
type EmployeeUpdate = Partial<Employee>
```

### Suffixes Courants

```typescript
// FormData - Données de formulaire
interface EmployeeFormData { }

// Update - Mise à jour partielle
interface EmployeeUpdate { }

// Filter - Filtres de recherche
interface EmployeeFilter { }

// Response - Réponse API
interface EmployeeResponse { }

// Row - Ligne de tableau
interface EmployeeRow { }

// Props - Props de composant
interface EmployeeCardProps { }
```

---

## 🔍 Vérification des Types

### Type Guards

```typescript
// Type guard pour vérifier un type
function isEmployee(obj: unknown): obj is Employee {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'firstName' in obj &&
    'lastName' in obj
  )
}

// Usage
if (isEmployee(data)) {
  console.log(data.firstName) // ✅ TypeScript sait que c'est un Employee
}
```

### Validation Zod (Recommandé)

```typescript
// Installation : pnpm add zod

import { z } from 'zod'

// Schéma de validation
const EmployeeSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
})

// Inférer le type depuis le schéma
type Employee = z.infer<typeof EmployeeSchema>

// Valider
const result = EmployeeSchema.safeParse(data)
if (result.success) {
  const employee: Employee = result.data
}
```

---

## ✅ Checklist Types

Avant de créer/modifier un type :

- [ ] Type vraiment réutilisé ? (sinon interface locale OK)
- [ ] Nom descriptif et cohérent avec les existants
- [ ] Interface pour objets, type pour unions
- [ ] Champs avec `?` optionnels si vraiment optionnels
- [ ] Commentaires JSDoc si type complexe
- [ ] Dates en format string (YYYY-MM-DD, HH:mm)
- [ ] Pas de `any` dans les définitions
- [ ] Export depuis le bon fichier (`/types/module.ts`)

---

**Voir aussi** :
- [CONVENTIONS.md](./CONVENTIONS.md) - Règles TypeScript
- [API_GUIDE.md](./API_GUIDE.md) - Types ApiResponse
