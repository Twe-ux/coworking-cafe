# Booking Date Components

Composants modulaires pour la sélection de date et horaires dans le flux de réservation.

## Structure

```
date/
├── DateHeader.tsx              # Progress bar + navigation
├── SpaceInfoCard.tsx          # Informations espace sélectionné
├── ReservationTypeSelector.tsx # Choix type réservation (horaire/journée/etc)
├── DatePicker.tsx             # Sélecteur de date
├── TimeSlotSelector.tsx       # Sélecteur créneaux horaires
├── PeopleStepper.tsx          # Compteur nombre de personnes
├── PriceSummary.tsx           # Résumé prix avec TTC/HT
├── BookingDateContent.tsx     # Composant principal (assemblage)
└── index.ts                   # Barrel export
```

## Composants

### DateHeader

Affiche la barre de progression du booking avec les étapes.

```tsx
<DateHeader
  currentStep={2}
  spaceSubtitle="Open-space"
  selectedDate="2026-02-08"
/>
```

### SpaceInfoCard

Affiche les informations de l'espace sélectionné (capacité, tarifs).

```tsx
<SpaceInfoCard
  spaceConfig={spaceConfig}
  spaceTitle="Espace Open-Space"
  spaceSubtitle="Bureau flexible"
/>
```

### ReservationTypeSelector

Permet de choisir le type de réservation (horaire, journée, hebdomadaire, mensuelle).

```tsx
<ReservationTypeSelector
  value="hourly"
  availableTypes={[...]}
  onChange={(type) => setReservationType(type)}
  onReset={() => resetTimes()}
/>
```

### DatePicker

Sélecteur de date pour la réservation.

```tsx
<DatePicker
  reservationType="hourly"
  selectedDate="2026-02-08"
  onChange={(date) => setSelectedDate(date)}
/>
```

### TimeSlotSelector

Sélecteur de créneaux horaires (heure d'arrivée/départ).

```tsx
<TimeSlotSelector
  reservationType="hourly"
  startTime="09:00"
  endTime="17:00"
  availableStartSlots={["09:00", "10:00", ...]}
  availableEndSlots={["17:00", "18:00", ...]}
  onStartTimeChange={(time) => setStartTime(time)}
  onEndTimeChange={(time) => setEndTime(time)}
/>
```

### PeopleStepper

Compteur pour sélectionner le nombre de personnes.

```tsx
<PeopleStepper
  value={2}
  minCapacity={1}
  maxCapacity={10}
  onChange={(count) => setNumberOfPeople(count)}
/>
```

### PriceSummary

Affiche le résumé du prix avec toggle TTC/HT.

```tsx
<PriceSummary
  price={50.00}
  duration="2h30"
  reservationType="hourly"
  numberOfPeople={2}
  showTTC={true}
  onToggleTTC={(show) => setShowTTC(show)}
  perPerson={false}
/>
```

### BookingDateContent

Composant principal qui assemble tous les composants ci-dessus.

```tsx
<BookingDateContent
  spaceInfo={spaceInfo}
  spaceConfig={spaceConfig}
  loading={false}
  availableReservationTypes={[...]}
  bookingState={bookingState}
  accordion={accordion}
  timeSlots={{ availableStartSlots, availableEndSlots }}
  pricing={pricing}
  validation={validation}
  handlers={handlers}
/>
```

## Hooks Associés

### useTimeSlots

Calcule les créneaux horaires disponibles en fonction des horaires d'ouverture.

```tsx
const { availableStartSlots, availableEndSlots } = useTimeSlots({
  globalHours,
  selectedDate,
  startTime,
  reservationType,
});
```

### useBookingHandlers

Fournit tous les handlers pour les interactions de booking.

```tsx
const {
  handleDateChange,
  handleStartTimeSelection,
  handleContinue,
  handleResetTimeSelections
} = useBookingHandlers({
  bookingState,
  accordion,
  validation,
  pricing,
  globalHours,
});
```

## Règles de Conformité

- ✅ Tous les composants < 200 lignes
- ✅ Props TypeScript strictes (zéro `any`)
- ✅ Composants modulaires et réutilisables
- ✅ Dates en format string (YYYY-MM-DD, HH:mm)
- ✅ Types exportés pour réutilisation

## Utilisation

Import depuis le barrel export :

```tsx
import {
  DateHeader,
  SpaceInfoCard,
  ReservationTypeSelector,
  DatePicker,
  TimeSlotSelector,
  PeopleStepper,
  PriceSummary,
  BookingDateContent,
} from '@/components/booking/date';
```

Ou import individuel :

```tsx
import { DateHeader } from '@/components/booking/date/DateHeader';
```

## Refactorisation

Ces composants ont été extraits de `/app/(site)/booking/[type]/new/page.tsx` (393 lignes)
pour rendre le code plus maintenable et conforme au CLAUDE.md (< 200 lignes).

**Réduction** : 393 → 156 lignes (-60%)

Date de refactorisation : 2026-02-08
