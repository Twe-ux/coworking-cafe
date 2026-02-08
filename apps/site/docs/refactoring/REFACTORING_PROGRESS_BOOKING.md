# Progression Refactorisation - Module Booking

**Module** : `/apps/site/src/app/(site)/booking/[type]/new/page.tsx`
**Status** : 🚧 En cours
**Date début** : 2026-02-08
**Branche** : `refacto/site-booking-module`

---

## 📊 État Initial

| Métrique | Valeur | Status |
|----------|--------|--------|
| **Lignes totales** | 1399 | 🔴 CRITIQUE (7x limite) |
| **useState** | 19 | 🔴 CRITIQUE |
| **useEffect** | 10 | 🔴 CRITIQUE |
| **Handlers** | 2+ | 🟡 À analyser |
| **any types** | 0 | ✅ OK |

---

## ✅ Étape 1 : Types & Constants (TERMINÉE)

**Date** : 2026-02-08
**Commit** : `5db940f`

### Ajouts dans `/types/booking.ts`

**Types ajoutés** :
- ✅ `SpaceConfiguration` - Config complète espace (pricing, capacité, types résa)
- ✅ `GlobalHours` - Horaires d'ouverture + fermetures exceptionnelles
- ✅ `ReservationTypeOption` - Option type réservation avec label/icon

**Constants ajoutées** :
- ✅ `SPACE_TYPE_MAPPING` - Mapping URL slug → valeur DB
- ✅ `ALL_RESERVATION_TYPES` - Array types avec icons Bootstrap
- ✅ `ALL_TIME_SLOTS` - 29 créneaux horaires (08:00-22:00)

**Résultat** : +91 lignes dans booking.ts

---

## ✅ Étape 2 : Hooks Personnalisés (TERMINÉE)

**Date** : 2026-02-08
**Commits** : `5d0e184`, `bf948f6`

### 5 Hooks Créés

#### 1. `useSpaceConfiguration.ts` (107 lignes)

**Responsabilités** :
- Fetch configuration espace depuis `/api/space-configurations/${spaceType}`
- Fetch horaires globaux depuis `/api/global-hours`
- Gestion loading/error
- Détection si espace nécessite devis

**Return** :
```typescript
{
  spaceConfig: SpaceConfiguration | null;
  globalHours: GlobalHours | null;
  loading: boolean;
  error: string;
  requiresQuote: boolean;
}
```

#### 2. `useBookingState.ts` (237 lignes)

**Responsabilités** :
- State management centralisé (11 états consolidés)
- Restauration depuis sessionStorage au mount
- Calcul automatique endDate pour weekly/monthly
- Actions : resetState(), saveToSessionStorage()

**États gérés** :
- Reservation type
- Dates (selected, end)
- Times (arrival, start, end)
- Pricing (calculatedPrice, duration, appliedDailyRate)
- Participants (numberOfPeople)
- UI (showTTC)

**Return** : État complet + setters + actions

#### 3. `usePriceCalculation.ts` (337 lignes)

**Responsabilités** :
- Calcul prix pour hourly/daily/weekly/monthly
- Appels API `/api/calculate-price` avec POST
- Règle des 5h : Si >= 5h hourly → tarif journée
- Conversion TTC ↔ HT (VAT 10% hourly <5h, 20% daily+)
- Fallback calcul simple si API échoue

**Return** :
```typescript
{
  calculatedPrice: number;
  displayPrice: number; // TTC ou HT selon showTTC
  duration: string;
  appliedDailyRate: boolean;
  calculating: boolean;
  error: string;
}
```

#### 4. `useBookingValidation.ts` (202 lignes)

**Responsabilités** :
- Validation date (pas passé, jour ouvert, fermetures exceptionnelles)
- Validation horaires hourly (heure fin > début, durée min 30min, dans plage ouverture)
- Validation horaires daily (arrivalTime dans plage ouverture)
- Validation nombre personnes (min/max capacité)

**Return** :
```typescript
{
  isValid: boolean; // True si 0 erreur
  errors: ValidationErrors; // Erreurs par champ
  canContinue: boolean; // True si tous champs requis remplis + valid
}
```

#### 5. `useBookingAccordion.ts` (180 lignes)

**Responsabilités** :
- Gestion accordions date/time (open/close/toggle)
- Animation fermeture avec state `dateSectionClosing`
- 3 refs pour auto-scroll (timeSectionRef, priceSectionRef, bookingCardRef)
- Fonctions scroll smooth vers sections

**Return** :
- States (dateSectionOpen, timeSectionOpen, etc.)
- Refs (timeSectionRef, priceSectionRef, bookingCardRef)
- Actions (toggle, open, close, scroll)

### Récapitulatif Étape 2

| Métrique | Valeur |
|----------|--------|
| **Hooks créés** | 5 |
| **Lignes extraites** | 1063 |
| **useState consolidés** | 19 → 11 (8 gérés par autres hooks) |
| **useEffect séparés** | 10 → distribués par responsabilité |
| **Duplication** | 0 |
| **Testabilité** | ✅ Chaque hook testable indépendamment |

---

## 🚧 Étape 3 : Composants UI (EN COURS)

**Date début** : À planifier
**Estimation** : 2-3h

### Composants à Créer

#### A. `ReservationTypeSelector.tsx` (~80 lignes)
- Sélection type (hourly/daily/weekly/monthly)
- Props: `value`, `onChange`, `availableTypes`

#### B. `DateSelectionSection.tsx` (~120 lignes)
- CustomDatePicker
- Gestion accordion date
- Props: `selectedDate`, `endDate`, `onDateChange`, `reservationType`

#### C. `TimeSelectionSection.tsx` (~150 lignes)
- Sélection heures (start/end) avec grid
- Slots disponibles filtrés
- Props: `startTime`, `endTime`, `onTimeChange`, `availableSlots`

#### D. `PriceDisplayCard.tsx` (~100 lignes)
- Affichage prix (TTC/HT)
- Toggle TTC/HT
- Breakdown (durée, personnes, total)
- Props: `price`, `duration`, `numberOfPeople`, `showTTC`, `onToggleTTC`

#### E. `BookingErrorDisplay.tsx` (~40 lignes)
- Affichage erreurs
- Props: `error`, `onDismiss`

---

## 📋 Étape 4 : Refactoriser Page (À FAIRE)

**Date début** : Après étape 3
**Estimation** : 1h

### Objectif

Refactoriser `page.tsx` (1399 lignes) en composant orchestrateur propre (< 200 lignes).

**Structure cible** :
```tsx
export default function BookingDatePage({ params }: Props) {
  // Hooks
  const { spaceConfig, globalHours } = useSpaceConfiguration({ ... });
  const bookingState = useBookingState({ ... });
  const pricing = usePriceCalculation({ ... });
  const validation = useBookingValidation({ ... });
  const accordion = useBookingAccordion();

  // Handlers
  const handleContinue = () => { /* ... */ };

  return (
    <div ref={accordion.bookingCardRef}>
      <BookingProgressBar step={1} />
      <ReservationTypeSelector {...} />
      <DateSelectionSection {...} />
      <TimeSelectionSection {...} />
      <PriceDisplayCard {...} />
      <BookingErrorDisplay {...} />
      <button onClick={handleContinue}>Continuer</button>
    </div>
  );
}
```

**Résultat attendu** :
- Fichier principal < 200 lignes
- Code déclaratif et lisible
- 0 logique métier (tout dans hooks)
- UI pure (tout dans composants)

---

## 📊 Rapport Responsivité (Parallèle)

**Agent** : acc42eb
**Fichier** : Rapport complet dans session

### Problèmes Identifiés

**🔴 Haute priorité (4)** :
1. Breakpoints non standards (769px au lieu de 768px, etc.)
2. Padding bottom excessif (15-20rem)
3. Time slots trop petits sur mobile (70px)
4. DatePicker overflow horizontal sur petits écrans

**🟡 Moyenne priorité (4)** :
5. Space cards grid sans breakpoint mobile explicite
6. Modal max-height trop restrictif
7. Price display size incohérent
8. Summary layout sans breakpoint md

**🟢 Basse priorité (2)** :
9. Sticky card breakpoint à 993px
10. Boutons quantité sans variation responsive

### Recommandations

- ✅ Normaliser breakpoints Bootstrap (576px, 768px, 992px, 1200px)
- ✅ Approche mobile-first stricte
- ✅ Utiliser plus Bootstrap utilities
- ✅ Réduire padding bottom à 4-6rem mobile

**Estimation correction** : 17-18h

---

## 🎯 Prochaines Actions

### Immédiat
1. ✅ Créer les 5 composants UI (Étape 3)
2. ✅ Refactoriser page.tsx (Étape 4)
3. ✅ Tester manuellement
4. ✅ Corriger problèmes responsive identifiés

### Après Refacto Booking
- Refactoriser autres pages booking (details, summary, etc.)
- Appliquer même pattern aux autres modules
- Tests E2E avec Playwright

---

## 📈 Métriques Finales (Projetées)

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Fichier principal** | 1399 lignes | < 200 lignes | -86% |
| **Fichiers totaux** | 1 | 15 | Modularité ✅ |
| **useState dans composant** | 19 | 0 | Logique extraite ✅ |
| **useEffect dans composant** | 10 | 0 | Séparation claire ✅ |
| **Testabilité** | ❌ Difficile | ✅ Facile | Hooks isolés ✅ |
| **Maintenabilité** | ❌ Faible | ✅ Élevée | Code modulaire ✅ |
| **Réutilisabilité** | ❌ Aucune | ✅ Forte | Hooks + composants ✅ |

---

**Dernière mise à jour** : 2026-02-08
**Auteur** : Thierry + Claude Sonnet 4.5
**Status** : Étape 2/4 terminée (50% complet)
