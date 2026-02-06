# Migration Guide: Step3Availability

Ce fichier explique comment utiliser la nouvelle structure modulaire de Step3Availability.

## 🔄 Changements pour les Développeurs

### Avant (Monolithique)

```typescript
// Tout était dans un seul fichier
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

// Impossible de réutiliser des sous-parties
// Impossible de tester la logique séparément
```

### Après (Modulaire)

```typescript
// Import principal (inchangé)
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

// Nouveaux imports disponibles (si besoin)
import {
  TimeSlotInput,
  DayAvailability,
  useAvailabilityForm
} from '@/components/hr/onboarding/step3-availability'
```

## 📦 Nouveaux Exports Disponibles

### Composants

```typescript
import {
  TimeSlotInput,           // Input créneau horaire atomique
  DayAvailability,         // Jour avec créneaux
  WeeklyDistributionTable, // Tableau 7j × 4 semaines
  AvailabilityTab,         // Onglet disponibilités
  DistributionTab          // Onglet répartition
} from '@/components/hr/onboarding/step3-availability'
```

### Hook Custom

```typescript
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'

// Usage
const {
  availability,
  weeklyDistribution,
  toggleDay,
  addSlot,
  removeSlot,
  updateSlot,
  canSubmit,
  // ... 13 valeurs/fonctions au total
} = useAvailabilityForm({
  initialAvailability,
  initialWeeklyDistribution,
  contractualHours: 35
})
```

### Types

```typescript
import type {
  TimeSlotWithId,
  DayConfig,
  UseAvailabilityFormProps,
  UseAvailabilityFormReturn
} from '@/components/hr/onboarding/step3-availability'

// Constants
import { DAYS, WEEKS } from '@/components/hr/onboarding/step3-availability'
```

## 🎯 Cas d'Usage

### Cas 1: Utiliser Step3Availability (Inchangé)

```typescript
// ✅ Aucun changement nécessaire
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

export function OnboardingWizard() {
  return (
    <Steps>
      <Step1 />
      <Step2 />
      <Step3Availability /> {/* Fonctionne exactement pareil */}
    </Steps>
  )
}
```

### Cas 2: Réutiliser le Composant TimeSlotInput

```typescript
// Créer un nouveau calendrier avec créneaux
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability'

export function MyScheduler() {
  const [slots, setSlots] = useState<TimeSlotWithId[]>([])

  return (
    <div>
      {slots.map(slot => (
        <TimeSlotInput
          key={slot.id}
          slot={slot}
          onStartChange={(val) => updateSlot(slot.id, 'start', val)}
          onEndChange={(val) => updateSlot(slot.id, 'end', val)}
          onRemove={() => removeSlot(slot.id)}
        />
      ))}
    </div>
  )
}
```

### Cas 3: Réutiliser la Logique (Hook)

```typescript
// Créer un autre formulaire de disponibilités
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'

export function EmployeeAvailabilityEditor({ employee }) {
  const {
    availability,
    toggleDay,
    addSlot,
    canSubmit,
    getCleanedAvailability
  } = useAvailabilityForm({
    initialAvailability: employee.availability,
    initialWeeklyDistribution: employee.weeklyDistribution,
    contractualHours: employee.contractualHours
  })

  const handleSave = () => {
    const data = getCleanedAvailability()
    updateEmployee(employee.id, { availability: data })
  }

  return (
    <form onSubmit={handleSave}>
      {/* Votre UI personnalisée */}
      <button type="submit" disabled={!canSubmit}>
        Sauvegarder
      </button>
    </form>
  )
}
```

### Cas 4: Réutiliser le Tableau de Répartition

```typescript
// Utiliser le tableau ailleurs
import { WeeklyDistributionTable } from '@/components/hr/onboarding/step3-availability'

export function MonthlyPlanner({ employee }) {
  const [distribution, setDistribution] = useState(employee.weeklyDistribution)

  return (
    <WeeklyDistributionTable
      availability={employee.availability}
      weeklyDistribution={distribution}
      onUpdateWeeklyHours={(day, week, value) => {
        setDistribution(prev => ({
          ...prev,
          [day]: { ...prev[day], [week]: value }
        }))
      }}
      calculateWeekTotal={(week) => {
        // Votre logique de calcul
      }}
    />
  )
}
```

## 🧪 Tests

### Tester le Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'

describe('useAvailabilityForm', () => {
  it('should toggle day availability', () => {
    const { result } = renderHook(() => useAvailabilityForm({
      initialAvailability: DEFAULT_AVAILABILITY,
      initialWeeklyDistribution: {},
      contractualHours: 35
    }))

    act(() => {
      result.current.toggleDay('monday')
    })

    expect(result.current.availability.monday.available).toBe(true)
  })

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useAvailabilityForm({
      // ...
    }))

    const total = result.current.calculateGrandTotal()
    expect(total).toBe(140) // 35h/semaine × 4
  })
})
```

### Tester un Composant

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { TimeSlotInput } from '@/components/hr/onboarding/step3-availability'

describe('TimeSlotInput', () => {
  it('should call onRemove when delete button clicked', () => {
    const mockRemove = jest.fn()

    render(
      <TimeSlotInput
        slot={{ id: '1', start: '09:00', end: '17:00' }}
        onStartChange={() => {}}
        onEndChange={() => {}}
        onRemove={mockRemove}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(mockRemove).toHaveBeenCalledTimes(1)
  })
})
```

## 📝 Modifications Courantes

### Ajouter un Nouveau Jour

```typescript
// 1. Modifier types.ts
export const DAYS = [
  // ... jours existants
  { key: 'special', label: 'Jour Spécial' },
] as const

// 2. Aucune autre modification nécessaire !
// Les composants itèrent automatiquement sur DAYS
```

### Changer la Validation

```typescript
// Modifier useAvailabilityForm.ts
const isDistributionValid = /* votre nouvelle logique */

// Exemple: autoriser ±5h de tolérance
const isDistributionValid = Math.abs(grandTotal - expectedTotal) < 5
```

### Personnaliser l'UI d'un Créneau

```typescript
// Modifier TimeSlotInput.tsx uniquement
export function TimeSlotInput({ slot, onStartChange, onEndChange, onRemove }) {
  return (
    <div className="custom-slot-design">
      {/* Votre UI personnalisée */}
    </div>
  )
}
```

## 🔄 Migration depuis l'Ancien Code

Si vous avez du code qui utilise l'ancienne structure :

### Avant

```typescript
// Tout était privé, impossible d'accéder aux sous-parties
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'
```

### Après

```typescript
// Accès aux sous-parties maintenant possible
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'
import { TimeSlotInput, useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'

// Possibilité de créer vos propres variantes
export function MyCustomAvailability() {
  const formLogic = useAvailabilityForm({ /* ... */ })

  return (
    <div>
      {/* Votre UI complètement personnalisée */}
      {/* Mais avec la même logique métier */}
    </div>
  )
}
```

## 🚨 Breaking Changes

**Aucun breaking change !** L'API publique de `Step3Availability` est identique.

Si vous importez uniquement `Step3Availability`, aucun changement n'est nécessaire.

## 📚 Documentation Complète

- **Architecture** : `step3-availability/README.md`
- **Refactoring détails** : `docs/REFACTORING_STEP3_AVAILABILITY.md`
- **Ce guide** : Migration et cas d'usage

## 💡 Bonnes Pratiques

### DO ✅

- Réutiliser les composants existants (TimeSlotInput, etc.)
- Réutiliser le hook pour la logique similaire
- Importer depuis `step3-availability/index.ts` (exports centralisés)
- Tester les composants indépendamment
- Documenter vos variantes custom

### DON'T ❌

- Ne pas copier-coller le code (réutiliser les exports)
- Ne pas modifier directement les fichiers du module (créer des wrappers)
- Ne pas dupliquer la logique (utiliser le hook)
- Ne pas ignorer les types (TypeScript strict)

## 🤝 Contribuer

Si vous améliorez un composant du module :

1. Maintenir la compatibilité backward
2. Respecter les conventions (< 200 lignes, zero `any`)
3. Ajouter tests si possible
4. Mettre à jour la documentation

## ❓ Questions Fréquentes

**Q: Puis-je utiliser TimeSlotInput ailleurs ?**
R: Oui ! C'est fait pour ça. Import et props typées.

**Q: Comment tester mon code qui utilise useAvailabilityForm ?**
R: Voir section "Tests" ci-dessus. Hook testable indépendamment.

**Q: Est-ce que ça casse mon code existant ?**
R: Non, aucun breaking change. API publique identique.

**Q: Puis-je créer ma propre variante ?**
R: Oui ! Réutiliser hook + créer votre UI.

**Q: Les types sont-ils disponibles ?**
R: Oui, tous exportés depuis `step3-availability/types.ts`

---

**Créé le** : 2026-01-20
**Pour** : Développeurs utilisant ou étendant Step3Availability
