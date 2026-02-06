# Guide d'Imports - Step3Availability

Guide de référence rapide pour importer les composants et types du module Step3Availability.

## 📦 Imports Disponibles

### Composant Principal

```typescript
// Import du composant orchestrateur (usage standard)
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

// Usage
<Step3Availability />
```

### Composants Atomiques

```typescript
// Import d'un composant atomique
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability'

// Props
interface TimeSlotInputProps {
  slot: TimeSlotWithId
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onRemove: () => void
}

// Usage
<TimeSlotInput
  slot={{ id: '1', start: '09:00', end: '17:00' }}
  onStartChange={(val) => console.log(val)}
  onEndChange={(val) => console.log(val)}
  onRemove={() => console.log('removed')}
/>
```

### Composants de Niveau Intermédiaire

```typescript
// DayAvailability
import { DayAvailability } from '@/components/hr/onboarding/step3-availability'

<DayAvailability
  day={{ key: 'monday', label: 'Lundi' }}
  availability={availability}
  onToggleDay={toggleDay}
  onAddSlot={addSlot}
  onUpdateSlot={updateSlot}
  onRemoveSlot={removeSlot}
/>

// WeeklyDistributionTable
import { WeeklyDistributionTable } from '@/components/hr/onboarding/step3-availability'

<WeeklyDistributionTable
  availability={availability}
  weeklyDistribution={weeklyDistribution}
  onUpdateWeeklyHours={updateWeeklyHours}
  calculateWeekTotal={calculateWeekTotal}
/>
```

### Composants Onglets

```typescript
// AvailabilityTab
import { AvailabilityTab } from '@/components/hr/onboarding/step3-availability'

<AvailabilityTab
  availability={availability}
  onToggleDay={toggleDay}
  onAddSlot={addSlot}
  onUpdateSlot={updateSlot}
  onRemoveSlot={removeSlot}
/>

// DistributionTab
import { DistributionTab } from '@/components/hr/onboarding/step3-availability'

<DistributionTab
  availability={availability}
  weeklyDistribution={weeklyDistribution}
  contractualHours={35}
  expectedTotal={140}
  grandTotal={grandTotal}
  isDistributionValid={isValid}
  onUpdateWeeklyHours={updateWeeklyHours}
  calculateWeekTotal={calculateWeekTotal}
/>
```

### Hook Custom

```typescript
// Import du hook
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'

// Usage
const {
  availability,
  weeklyDistribution,
  toggleDay,
  addSlot,
  removeSlot,
  updateSlot,
  updateWeeklyHours,
  calculateWeekTotal,
  calculateGrandTotal,
  isDistributionValid,
  hasAvailability,
  canSubmit,
  getCleanedAvailability,
} = useAvailabilityForm({
  initialAvailability: DEFAULT_AVAILABILITY,
  initialWeeklyDistribution: {},
  contractualHours: 35,
})
```

### Types

```typescript
// Import des types
import type {
  TimeSlotWithId,
  DayConfig,
  UseAvailabilityFormProps,
  UseAvailabilityFormReturn,
} from '@/components/hr/onboarding/step3-availability'

// Types globaux (déjà disponibles)
import type {
  Availability,
  AvailabilitySlot,
  WeeklyDistributionData,
} from '@/types/onboarding'
```

### Constantes

```typescript
// Import des constantes
import { DAYS, WEEKS } from '@/components/hr/onboarding/step3-availability'

// DAYS
const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const

// WEEKS
const WEEKS = ['week1', 'week2', 'week3', 'week4'] as const

// Usage
DAYS.map(({ key, label }) => (
  <div key={key}>{label}</div>
))
```

### Import Multiple

```typescript
// Importer plusieurs éléments
import {
  TimeSlotInput,
  DayAvailability,
  useAvailabilityForm,
  DAYS,
  WEEKS,
  type TimeSlotWithId,
  type DayConfig,
} from '@/components/hr/onboarding/step3-availability'
```

## 🔧 Utilitaires (Non Exportés)

Les fonctions utilitaires dans `utils.ts` sont internes au module et non exportées :

```typescript
// ❌ NE PAS FAIRE
import { generateSlotId } from '@/components/hr/onboarding/step3-availability'
// Erreur : generateSlotId n'est pas exporté

// ✅ À LA PLACE
// Si vous avez besoin de générer un ID, utilisez le hook useAvailabilityForm
// qui gère automatiquement la création de slots avec IDs
```

## 📁 Chemins d'Import

| Élément | Chemin |
|---------|--------|
| **Step3Availability** | `@/components/hr/onboarding/Step3Availability` |
| **Composants** | `@/components/hr/onboarding/step3-availability` |
| **Hook** | `@/components/hr/onboarding/step3-availability` |
| **Types** | `@/components/hr/onboarding/step3-availability` |
| **Constantes** | `@/components/hr/onboarding/step3-availability` |
| **Types globaux** | `@/types/onboarding` |

## 🎯 Patterns d'Import Recommandés

### Pattern 1: Utilisation Standard

```typescript
// Pour utiliser Step3Availability tel quel
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

export function OnboardingPage() {
  return <Step3Availability />
}
```

### Pattern 2: Réutilisation Partielle

```typescript
// Pour réutiliser des composants spécifiques
import { TimeSlotInput, DayAvailability } from '@/components/hr/onboarding/step3-availability'
import type { TimeSlotWithId } from '@/components/hr/onboarding/step3-availability'

export function MyCustomScheduler() {
  return (
    <>
      <DayAvailability /* ... */ />
      <TimeSlotInput /* ... */ />
    </>
  )
}
```

### Pattern 3: Logique Réutilisée

```typescript
// Pour réutiliser la logique métier avec UI custom
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'
import type { Availability } from '@/types/onboarding'

export function MyAvailabilityEditor() {
  const formLogic = useAvailabilityForm({ /* ... */ })

  return (
    <div>
      {/* Votre UI personnalisée */}
      {/* Utilise formLogic.availability, formLogic.toggleDay, etc. */}
    </div>
  )
}
```

### Pattern 4: Avec Constantes

```typescript
// Pour utiliser les constantes (DAYS, WEEKS)
import { DAYS, WEEKS } from '@/components/hr/onboarding/step3-availability'

export function MyCalendar() {
  return (
    <>
      {DAYS.map(({ key, label }) => (
        <div key={key}>{label}</div>
      ))}
      {WEEKS.map((week) => (
        <div key={week}>{week}</div>
      ))}
    </>
  )
}
```

## ⚠️ Erreurs Courantes

### Erreur 1: Mauvais Chemin

```typescript
// ❌ MAUVAIS
import { TimeSlotInput } from '@/components/hr/onboarding/Step3Availability'
// Erreur : TimeSlotInput n'est pas exporté depuis Step3Availability.tsx

// ✅ BON
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability'
// Correct : Importer depuis le sous-module
```

### Erreur 2: Import Direct de Fichier

```typescript
// ❌ MAUVAIS
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability/TimeSlotInput'
// Mauvaise pratique : import direct du fichier

// ✅ BON
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability'
// Correct : Importer depuis index.ts (exports centralisés)
```

### Erreur 3: Type vs Valeur

```typescript
// ❌ MAUVAIS
import { TimeSlotWithId } from '@/components/hr/onboarding/step3-availability'
// Peut causer des problèmes avec TypeScript

// ✅ BON
import type { TimeSlotWithId } from '@/components/hr/onboarding/step3-availability'
// Correct : Utiliser 'type' pour les imports de types
```

## 📝 Checklist Import

Avant d'importer, vérifier :

- [ ] Le composant/type/hook est-il exporté ? (voir `index.ts`)
- [ ] J'utilise le bon chemin ? (`step3-availability` vs `Step3Availability`)
- [ ] J'utilise `type` pour les types ? (`import type { ... }`)
- [ ] Je n'importe pas directement depuis un fichier ? (utiliser `index.ts`)

## 🔍 Voir Aussi

- **Exports disponibles** : `step3-availability/index.ts`
- **Types disponibles** : `step3-availability/types.ts`
- **Guide migration** : `MIGRATION_GUIDE.md`
- **Documentation** : `README.md`

---

**Dernière mise à jour** : 2026-01-20
