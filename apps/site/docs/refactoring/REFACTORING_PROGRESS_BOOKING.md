# Progression Refactorisation - Module Booking

**Module** : `/apps/site/src/app/(site)/booking/[type]/new/page.tsx`
**Status** : ✅ Terminée
**Date début** : 2026-02-08
**Date fin** : 2026-02-08
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

## ✅ Étape 3 : Composants UI (TERMINÉE)

**Date** : 2026-02-08
**Commits** : `[TBD]`

### 5 Composants Créés (778 lignes total)

#### 1. `BookingErrorDisplay.tsx` (73 lignes)
**Responsabilités** :
- Affichage messages d'erreur/warning/info
- Support dismiss optionnel
- 3 variantes : danger (rouge), warning (orange), info (bleu)

**Props** :
```typescript
interface BookingErrorDisplayProps {
  error?: string;
  type?: "danger" | "warning" | "info";
  onDismiss?: () => void;
  className?: string;
}
```

#### 2. `ReservationTypeSelector.tsx` (93 lignes)
**Responsabilités** :
- Sélection type réservation (hourly/daily/weekly/monthly)
- Affiche uniquement types disponibles pour l'espace
- Reset time selections quand type change
- Affichage grid avec icônes Bootstrap

**Props** :
```typescript
interface ReservationTypeSelectorProps {
  value: ReservationType;
  availableTypes: ReservationTypeOption[];
  onChange: (type: ReservationType) => void;
  onReset?: () => void;
}
```

#### 3. `DateSelectionSection.tsx` (154 lignes)
**Responsabilités** :
- Section accordion avec CustomDatePicker
- Calcul automatique min/max dates (aujourd'hui, +70 jours)
- Formatage date affichée (ex: "10 février")
- Animation smooth open/close

**Props** :
```typescript
interface DateSelectionSectionProps {
  reservationType: ReservationType;
  selectedDate: string;
  endDate: string;
  onDateChange: (date: string) => void;
  isOpen: boolean;
  isClosing: boolean;
  onToggle: () => void;
}
```

#### 4. `TimeSelectionSection.tsx` (279 lignes)
**Responsabilités** :
- Accordion avec 2 modes : hourly (start+end) ou daily (arrival)
- Grid temps responsive (2 colonnes hourly, 1 colonne daily)
- Désactivation end slots < 1h après start
- ForwardRef pour scroll contrôlé par parent

**Props** :
```typescript
interface TimeSelectionSectionProps {
  reservationType: ReservationType;
  selectedDate: string;
  startTime: string;
  endTime: string;
  arrivalTime: string;
  availableStartSlots: string[];
  availableEndSlots: string[];
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onArrivalTimeChange: (time: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}
```

#### 5. `PriceDisplayCard.tsx` (179 lignes)
**Responsabilités** :
- Affichage prix avec toggle TTC/HT
- Display durée (sauf daily)
- Label "Prix total" (perPerson) ou "Prix fixe"
- Switch Bootstrap entre TTC/HT
- Ref pour scroll auto

**Props** :
```typescript
interface PriceDisplayCardProps {
  price: number;
  duration: string;
  reservationType: ReservationType;
  numberOfPeople: number;
  showTTC: boolean;
  onToggleTTC: (showTTC: boolean) => void;
  perPerson: boolean;
}
```

---

## ✅ Étape 4 : Refactoriser Page (TERMINÉE)

**Date** : 2026-02-08
**Commit** : `[TBD]`

### Résultat Final

✅ **Fichier principal** : `page.tsx` - 344 lignes (vs 1399 lignes avant)
✅ **Réduction** : -75% de lignes
✅ **useState dans page** : 0 (vs 19 avant) - Tous dans hooks
✅ **useEffect dans page** : 0 (vs 10 avant) - Tous dans hooks
✅ **Logique métier** : 0 ligne - Tout dans hooks
✅ **Markup JSX** : Composants réutilisables

### Structure Finale

```tsx
export default function BookingDatePage({ params }: BookingDatePageProps) {
  const router = useRouter();

  // 🎯 Configuration et données
  const spaceInfo = SPACE_TYPE_INFO[params.type] || { title: "Espace", subtitle: "" };
  const dbSpaceType = SPACE_TYPE_MAPPING[params.type] || params.type;

  // 🎯 Hooks de données
  const { spaceConfig, globalHours, loading, error, requiresQuote } =
    useSpaceConfiguration({ spaceType: dbSpaceType });

  const bookingState = useBookingState({ spaceType: params.type });

  const pricing = usePriceCalculation({
    spaceType: dbSpaceType,
    reservationType: bookingState.reservationType,
    selectedDate: bookingState.selectedDate,
    startTime: bookingState.startTime,
    endTime: bookingState.endTime,
    arrivalTime: bookingState.arrivalTime,
    numberOfPeople: bookingState.numberOfPeople,
    spaceConfig,
    globalHours,
    showTTC: bookingState.showTTC,
  });

  const validation = useBookingValidation({
    reservationType: bookingState.reservationType,
    selectedDate: bookingState.selectedDate,
    startTime: bookingState.startTime,
    endTime: bookingState.endTime,
    arrivalTime: bookingState.arrivalTime,
    numberOfPeople: bookingState.numberOfPeople,
    spaceConfig,
    globalHours,
  });

  const accordion = useBookingAccordion();

  // 🎯 Computed data
  const availableReservationTypes = useMemo(() => {
    return ALL_RESERVATION_TYPES.filter((type) =>
      spaceConfig?.availableReservationTypes[type.id]
    );
  }, [spaceConfig]);

  // 🎯 Helper functions (pure)
  const getAvailableStartTimeSlots = (): string[] => { /* ... */ };
  const getAvailableEndTimeSlots = (): string[] => { /* ... */ };

  // 🎯 Handlers
  const handleStartTimeSelection = (time: string) => {
    bookingState.setStartTime(time);
    setTimeout(() => accordion.scrollToPriceSection(), 300);
  };

  const handleContinue = () => {
    if (!validation.canContinue) return;
    bookingState.saveToSessionStorage();
    router.push("/booking/details");
  };

  // 🎯 Early returns
  if (error) return <BookingErrorDisplay error={error} type="danger" />;
  if (requiresQuote) { router.push("/contact"); return null; }

  // 🎯 Render (composants UI)
  return (
    <section className="booking-date-page py-3">
      <div className="container">
        <div className="booking-card" ref={accordion.bookingCardRef}>
          <BookingProgressBar currentStep={2} />

          {loading && <LoadingSpinner />}

          {!loading && (
            <>
              <ReservationTypeSelector
                value={bookingState.reservationType}
                availableTypes={availableReservationTypes}
                onChange={bookingState.setReservationType}
                onReset={handleResetTimeSelections}
              />

              <DateSelectionSection
                reservationType={bookingState.reservationType}
                selectedDate={bookingState.selectedDate}
                endDate={bookingState.endDate}
                onDateChange={bookingState.setSelectedDate}
                isOpen={accordion.dateSectionOpen}
                isClosing={accordion.dateSectionClosing}
                onToggle={accordion.toggleDateSection}
              />

              <TimeSelectionSection
                ref={accordion.timeSectionRef}
                reservationType={bookingState.reservationType}
                selectedDate={bookingState.selectedDate}
                startTime={bookingState.startTime}
                endTime={bookingState.endTime}
                arrivalTime={bookingState.arrivalTime}
                availableStartSlots={getAvailableStartTimeSlots()}
                availableEndSlots={getAvailableEndTimeSlots()}
                onStartTimeChange={handleStartTimeSelection}
                onEndTimeChange={bookingState.setEndTime}
                onArrivalTimeChange={bookingState.setArrivalTime}
                isOpen={accordion.timeSectionOpen}
                onToggle={accordion.toggleTimeSection}
              />

              {pricing.calculatedPrice > 0 && (
                <PriceDisplayCard
                  price={pricing.displayPrice}
                  duration={pricing.duration}
                  reservationType={bookingState.reservationType}
                  numberOfPeople={bookingState.numberOfPeople}
                  showTTC={bookingState.showTTC}
                  onToggleTTC={bookingState.setShowTTC}
                  perPerson={spaceConfig?.pricing.perPerson || false}
                />
              )}

              {!validation.isValid && Object.keys(validation.errors).length > 0 && (
                <div className="mb-3">
                  {Object.values(validation.errors).map((err, idx) => (
                    <BookingErrorDisplay key={idx} error={err} type="warning" />
                  ))}
                </div>
              )}

              <button
                className="btn btn-success btn-lg w-100"
                onClick={handleContinue}
                disabled={!validation.canContinue || loading}
              >
                Continuer vers les détails
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

### Points Clés

✅ **Séparation des responsabilités** :
- Hooks → État + logique métier
- Composants → Présentation UI
- Page → Orchestration + composition

✅ **Code déclaratif** :
- Pas de logique complexe dans la page
- Early returns pour cas d'erreur
- Helpers purs pour calculs simples

✅ **Maintenabilité** :
- Chaque modification localisée
- Hooks testables indépendamment
- Composants réutilisables

✅ **Performance** :
- useMemo pour types disponibles
- useCallback dans tous les hooks
- Pas de re-render inutiles

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
1. ✅ Créer les 5 composants UI (Étape 3) - FAIT
2. ✅ Refactoriser page.tsx (Étape 4) - FAIT
3. 🔄 Tester manuellement - À FAIRE
4. 🔄 Corriger problèmes responsive identifiés - À PLANIFIER

### Après Refacto Booking
- Refactoriser autres pages booking (details, summary, etc.)
- Appliquer même pattern aux autres modules
- Tests E2E avec Playwright

---

## 📈 Métriques Finales (RÉELLES)

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Fichier principal** | 1399 lignes | 344 lignes | -75% ✅ |
| **Fichiers totaux** | 1 | 11 fichiers | Modularité ✅ |
| **useState dans composant** | 19 | 0 | Logique extraite ✅ |
| **useEffect dans composant** | 10 | 0 | Séparation claire ✅ |
| **Testabilité** | ❌ Difficile | ✅ Facile | Hooks isolés ✅ |
| **Maintenabilité** | ❌ Faible | ✅ Élevée | Code modulaire ✅ |
| **Réutilisabilité** | ❌ Aucune | ✅ Forte | Hooks + composants ✅ |

### Détail des 11 Fichiers Créés

1. **Types** : `types/booking.ts` (+91 lignes)
2. **Hooks** :
   - `useSpaceConfiguration.ts` (107 lignes)
   - `useBookingState.ts` (237 lignes)
   - `usePriceCalculation.ts` (337 lignes)
   - `useBookingValidation.ts` (202 lignes)
   - `useBookingAccordion.ts` (180 lignes)
3. **Composants** :
   - `BookingErrorDisplay.tsx` (73 lignes)
   - `ReservationTypeSelector.tsx` (93 lignes)
   - `DateSelectionSection.tsx` (154 lignes)
   - `TimeSelectionSection.tsx` (279 lignes)
   - `PriceDisplayCard.tsx` (179 lignes)

**Total code écrit** : 1932 lignes modulaires (vs 1399 monolithiques)

---

**Dernière mise à jour** : 2026-02-08
**Auteur** : Thierry + Claude Sonnet 4.5
**Status** : ✅ Refactoring terminé - Tests manuels à faire
