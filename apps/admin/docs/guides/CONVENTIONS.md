# Conventions de Code (STRICTES)

Règles obligatoires pour maintenir un code propre et cohérent.

## 1. TypeScript - ZÉRO `any`

### Règles Strictes

```typescript
// ❌ INTERDIT
function handleData(data: any) { }
const result: any = await fetch(...)

// ✅ CORRECT
interface EmployeeData {
  id: string
  firstName: string
  lastName: string
}

function handleData(data: EmployeeData): void { }
const result: EmployeeData = await fetch(...)
```

### Checklist TypeScript

- ✅ Toujours typer les paramètres de fonction
- ✅ Toujours typer les retours de fonction
- ✅ Utiliser les types partagés de `/types/`
- ✅ Créer des `interface` pour objets, `type` pour unions
- ❌ Jamais `as any` sans justification documentée
- ❌ Jamais `@ts-ignore` ou `@ts-expect-error`

---

## 2. Formats de Dates et Heures

### RÈGLE STRICTE : Toujours des Strings

```typescript
// ❌ INTERDIT - Timestamps ISO avec timezone
{
  date: new Date("2026-01-16T00:00:00.000Z"),  // ❌ Bugs timezone
  clockIn: new Date("2026-01-16T09:00:00.000Z") // ❌
}

// ✅ CORRECT - Strings simples
{
  date: "2026-01-16",    // YYYY-MM-DD
  clockIn: "09:00",      // HH:mm
  clockOut: "17:30"      // Format HH:mm
}
```

### Types à Utiliser

```typescript
// /types/timeEntry.ts
interface TimeEntry {
  id: string
  employeeId: string
  date: string        // YYYY-MM-DD
  clockIn: string     // HH:mm
  clockOut?: string   // HH:mm | null
  shiftNumber: 1 | 2
  status: 'active' | 'completed'
}
```

### Transformation Date ↔ String

```typescript
// Si besoin de manipuler comme Date (côté client uniquement)
function toDateObject(entry: TimeEntry) {
  return {
    ...entry,
    date: new Date(entry.date),
    clockIn: new Date(`${entry.date}T${entry.clockIn}`),
    clockOut: entry.clockOut ? new Date(`${entry.date}T${entry.clockOut}`) : null,
  }
}
```

---

## 3. Taille des Fichiers

### Limites Strictes

| Type de fichier | Max lignes | Action si dépassé |
|-----------------|------------|-------------------|
| **Composants React** | 200 | Extraire sous-composants ou hooks |
| **Custom Hooks** | 150 | Séparer en hooks spécialisés |
| **Pages Next.js** | 150 | Logique → hooks, UI → composants |
| **API Routes** | 200 | Extraire validation/logique en utils |
| **Models Mongoose** | 150 | Utiliser structure modulaire (5 fichiers) |
| **Utils/Helpers** | 200 | Découper par responsabilité |

### Comment Découper un Gros Composant

```typescript
// ❌ MAUVAIS - Tout dans un fichier (300 lignes)
export function EmployeeList() {
  // 50 lignes de logique
  // 50 lignes de state
  // 100 lignes de handlers
  // 100 lignes de JSX
}

// ✅ BON - Découpage propre

// hooks/useEmployeeList.ts (80 lignes)
export function useEmployeeList() {
  // Toute la logique ici
  return { employees, loading, error, actions }
}

// components/EmployeeList.tsx (120 lignes)
export function EmployeeList() {
  const { employees, loading, error, actions } = useEmployeeList()

  if (loading) return <EmployeeListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <EmployeeHeader actions={actions} />
      <EmployeeTable employees={employees} />
      <EmployeePagination />
    </div>
  )
}
```

---

## 4. Nommage

### Fichiers

- **Composants** : `PascalCase.tsx` (EmployeeList.tsx)
- **Hooks** : `camelCase.ts` (useEmployees.ts)
- **Utils** : `kebab-case.ts` (format-date.ts)
- **Types** : `camelCase.ts` (timeEntry.ts)
- **API routes** : `route.ts` (convention Next.js)

### Variables

```typescript
// ❌ INTERDIT - Noms génériques
const data = await fetch(...)
const result = handleStuff()
const temp = employee

// ✅ CORRECT - Noms descriptifs
const employeesData = await fetch(...)
const validationResult = handleValidation()
const activeEmployee = employee
```

### Fonctions

```typescript
// ❌ INTERDIT - Verbes seuls
function process() {}
function handle() {}
function do() {}

// ✅ CORRECT - Verbe + Nom
function processEmployee() {}
function handleSubmit() {}
function validateForm() {}
function fetchEmployees() {}
```

---

## 5. Composants Réutilisables

### Principe : Flexibilité avec `children`

```typescript
// ❌ MAUVAIS - Duplication
<HeroOne />
<HeroTwo />
<HeroThree />

// ✅ BON - Composant flexible
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>
```

### Pattern Recommandé

```typescript
// components/ui/Card.tsx
interface CardProps {
  title?: string
  variant?: 'default' | 'outlined' | 'filled'
  children: React.ReactNode
  className?: string
}

export function Card({ title, variant = 'default', children, className }: CardProps) {
  return (
    <div className={cn(cardVariants[variant], className)}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
```

---

## 6. Imports

### Ordre des Imports

```typescript
// 1. Externes (React, Next, etc.)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Internes (composants, hooks)
import { Button } from '@/components/ui/button'
import { useEmployees } from '@/hooks/useEmployees'

// 3. Types
import type { Employee } from '@/types/hr'

// 4. Styles (si applicable)
import './styles.css'
```

### Imports Absolus

```typescript
// ✅ BON - Imports absolus avec @/
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types/hr'

// ❌ ÉVITER - Imports relatifs complexes
import { Button } from '../../../components/ui/button'
```

---

## 7. Gestion d'Erreurs

### Pattern Try/Catch Systématique

```typescript
// API Routes
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return successResponse(data)
  } catch (error) {
    console.error('[Route] Error:', error)
    return errorResponse(
      'Message utilisateur friendly',
      error.message,
      500
    )
  }
}

// Hooks
export function useEmployees() {
  try {
    // Logic
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Erreur inconnue')
  }
}
```

---

## 8. Commentaires

### Quand Commenter

```typescript
// ✅ BON - Commenter le POURQUOI, pas le QUOI
// Utilise Date.now() car performance critique (évite new Date())
const timestamp = Date.now()

// ❌ MAUVAIS - Commenter l'évident
// Crée une variable timestamp
const timestamp = Date.now()
```

### JSDoc pour Fonctions Publiques

```typescript
/**
 * Récupère la liste des employés actifs
 *
 * @param status - Filtrer par statut ('active' | 'inactive' | 'all')
 * @returns Liste d'employés avec loading/error state
 */
export function useEmployees(status?: EmployeeStatus) {
  // ...
}
```

---

## 9. Responsive Design

### Mobile-First avec Tailwind

```tsx
// ✅ BON - Mobile first, puis breakpoints
<div className="
  flex flex-col          /* Mobile: colonne */
  md:flex-row            /* Tablet: ligne */
  gap-4                  /* Espacement */
  p-4 md:p-6            /* Padding responsive */
">
  {children}
</div>
```

---

## 10. Performance

### Éviter les Re-renders Inutiles

```typescript
// ✅ BON - Mémoriser les callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])

// ✅ BON - Mémoriser les valeurs calculées
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

---

## ✅ Checklist Avant Commit

- [ ] Aucun type `any` dans mon code
- [ ] Fichiers < limites définies (200 lignes max pour composants)
- [ ] Dates en format string (YYYY-MM-DD, HH:mm)
- [ ] Nommage clair et descriptif
- [ ] Imports bien organisés
- [ ] Try/catch sur toutes les opérations async
- [ ] Commentaires sur le "pourquoi", pas le "quoi"
- [ ] Composants réutilisables (pas de duplication)
- [ ] `pnpm type-check` passe sans erreur

---

**Voir aussi** :
- [TYPES_GUIDE.md](./TYPES_GUIDE.md) - Guide des types partagés
- [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) - Guide des composants
