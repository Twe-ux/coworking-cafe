# Hook useBookingForm - apps/site

Documentation du hook custom pour gérer le formulaire de réservation.

## Vue d'ensemble

Hook React qui encapsule toute la logique du formulaire de réservation :
- State management (formData, errors, loading)
- Validation côté client
- Appel API pour calcul de prix
- Gestion d'erreurs

## Import

```typescript
import { useBookingForm } from '@/hooks';
// ou
import { useBookingForm } from '@/hooks/useBookingForm';
```

## Signature

```typescript
function useBookingForm(): UseBookingFormReturn

interface UseBookingFormReturn {
  formData: BookingFormData;
  errors: ValidationErrors;
  loading: boolean;
  handleChange: (field: keyof BookingFormData, value: string | number) => void;
  validateForm: () => boolean;
  handleSubmit: () => Promise<{ success: boolean; data?: CalculatePriceResponse }>;
  resetForm: () => void;
}
```

## Types

```typescript
interface BookingFormData {
  spaceId: string;
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  numberOfPeople: number;
  promoCode?: string;
  specialRequests?: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  spaceId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: string;
  promoCode?: string;
  specialRequests?: string;
  general?: string;
}
```

## Utilisation de base

```tsx
import { useBookingForm } from '@/hooks';

export function BookingPage() {
  const { formData, errors, loading, handleChange, handleSubmit } = useBookingForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await handleSubmit();

    if (result.success) {
      // Rediriger vers page confirmation
      router.push('/booking/confirmation');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <select
        value={formData.spaceId}
        onChange={(e) => handleChange('spaceId', e.target.value)}
      >
        <option value="">Sélectionner un espace</option>
        {/* Options */}
      </select>
      {errors.spaceId && <span className="error">{errors.spaceId}</span>}

      <input
        type="date"
        value={formData.date}
        onChange={(e) => handleChange('date', e.target.value)}
      />
      {errors.date && <span className="error">{errors.date}</span>}

      <button type="submit" disabled={loading}>
        {loading ? 'Calcul en cours...' : 'Continuer'}
      </button>
    </form>
  );
}
```

## API

### formData

État actuel du formulaire.

**Type:** `BookingFormData`

**Valeurs initiales:**
```typescript
{
  spaceId: '',
  date: '',
  startTime: '',
  endTime: '',
  numberOfPeople: 1,
  promoCode: '',
  specialRequests: ''
}
```

### errors

Erreurs de validation pour chaque champ.

**Type:** `ValidationErrors`

**Exemple:**
```typescript
{
  spaceId: 'Veuillez sélectionner un espace',
  endTime: "L'heure de fin doit être après l'heure de début"
}
```

### loading

Indique si une requête API est en cours.

**Type:** `boolean`

**Usage:**
```tsx
<button disabled={loading}>
  {loading ? 'Calcul...' : 'Continuer'}
</button>
```

### handleChange

Met à jour un champ du formulaire.

**Signature:**
```typescript
(field: keyof BookingFormData, value: string | number) => void
```

**Exemple:**
```tsx
<input
  value={formData.date}
  onChange={(e) => handleChange('date', e.target.value)}
/>

<input
  type="number"
  value={formData.numberOfPeople}
  onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
/>
```

**Comportement:**
- Met à jour `formData[field]`
- Nettoie automatiquement l'erreur du champ modifié

### validateForm

Valide tous les champs du formulaire.

**Signature:**
```typescript
() => boolean
```

**Retour:**
- `true` si formulaire valide
- `false` si erreurs (stockées dans `errors`)

**Appel automatique:**
- Appelé automatiquement par `handleSubmit()`
- Peut être appelé manuellement pour validation temps réel

**Exemple:**
```tsx
const handleBlur = () => {
  if (validateForm()) {
    console.log('Formulaire valide');
  }
};
```

### handleSubmit

Valide et soumet le formulaire à l'API.

**Signature:**
```typescript
() => Promise<{ success: boolean; data?: CalculatePriceResponse }>
```

**Comportement:**
1. Appelle `validateForm()`
2. Si valide, envoie `POST /api/booking/calculate`
3. Retourne le résultat

**Exemple:**
```tsx
const result = await handleSubmit();

if (result.success && result.data) {
  console.log('Prix calculé:', result.data.pricing.totalPrice);
  // Rediriger vers confirmation
} else {
  console.log('Erreur:', errors.general);
}
```

### resetForm

Réinitialise le formulaire aux valeurs initiales.

**Signature:**
```typescript
() => void
```

**Exemple:**
```tsx
<button type="button" onClick={resetForm}>
  Réinitialiser
</button>
```

## Règles de validation

### spaceId
- ✅ Requis
- ❌ Ne peut pas être vide

### date
- ✅ Requis
- ✅ Format YYYY-MM-DD
- ❌ Ne peut pas être dans le passé

### startTime
- ✅ Requis
- ✅ Format HH:mm

### endTime
- ✅ Requis
- ✅ Format HH:mm
- ❌ Doit être après startTime
- ❌ Durée minimale : 1 heure
- ❌ Durée maximale : 12 heures

### numberOfPeople
- ✅ Requis
- ✅ Min : 1
- ✅ Max : 50

### promoCode (optionnel)
- ✅ Min 3 caractères (si fourni)
- ✅ Lettres et chiffres uniquement

### specialRequests (optionnel)
- ✅ Max 500 caractères

## API appelée

### POST /api/booking/calculate

**Request Body:**
```typescript
{
  spaceId: string,
  date: string,
  startTime: string,
  endTime: string,
  numberOfPeople: number,
  promoCode?: string,
  specialRequests?: string
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    available: boolean,
    space: {
      id: string,
      name: string,
      pricePerHour: number
    },
    booking: {
      date: string,
      startTime: string,
      endTime: string,
      numberOfPeople: number,
      hours: number
    },
    pricing: {
      basePrice: number,
      discount: number,
      totalPrice: number,
      promo: {
        code: string,
        description: string
      } | null
    }
  }
}
```

**Response Error:**
```typescript
{
  success: false,
  error: string
}
```

## Exemple complet

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useBookingForm } from '@/hooks';

export default function BookingPage() {
  const router = useRouter();
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm
  } = useBookingForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await handleSubmit();

    if (result.success && result.data) {
      // Stocker les données pour la page suivante
      sessionStorage.setItem('bookingData', JSON.stringify(result.data));

      // Rediriger vers confirmation
      router.push('/booking/confirmation');
    }
  };

  return (
    <main className="page-booking">
      <h1>Réserver un Espace</h1>

      <form onSubmit={onSubmit} className="booking-form">
        {/* Espace */}
        <div className="form-field">
          <label htmlFor="spaceId">Espace</label>
          <select
            id="spaceId"
            value={formData.spaceId}
            onChange={(e) => handleChange('spaceId', e.target.value)}
            className={errors.spaceId ? 'input--error' : ''}
          >
            <option value="">Sélectionner un espace</option>
            <option value="space-1">Open Space</option>
            <option value="space-2">Salle de réunion</option>
          </select>
          {errors.spaceId && <span className="error">{errors.spaceId}</span>}
        </div>

        {/* Date */}
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={errors.date ? 'input--error' : ''}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>

        {/* Heures */}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="startTime">Début</label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className={errors.startTime ? 'input--error' : ''}
            />
            {errors.startTime && <span className="error">{errors.startTime}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="endTime">Fin</label>
            <input
              type="time"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className={errors.endTime ? 'input--error' : ''}
            />
            {errors.endTime && <span className="error">{errors.endTime}</span>}
          </div>
        </div>

        {/* Nombre de personnes */}
        <div className="form-field">
          <label htmlFor="numberOfPeople">Nombre de personnes</label>
          <input
            type="number"
            id="numberOfPeople"
            min="1"
            max="50"
            value={formData.numberOfPeople}
            onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
            className={errors.numberOfPeople ? 'input--error' : ''}
          />
          {errors.numberOfPeople && (
            <span className="error">{errors.numberOfPeople}</span>
          )}
        </div>

        {/* Code promo (optionnel) */}
        <div className="form-field">
          <label htmlFor="promoCode">Code promo (optionnel)</label>
          <input
            type="text"
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => handleChange('promoCode', e.target.value)}
            placeholder="STUDENT2026"
            className={errors.promoCode ? 'input--error' : ''}
          />
          {errors.promoCode && <span className="error">{errors.promoCode}</span>}
        </div>

        {/* Requêtes spéciales (optionnel) */}
        <div className="form-field">
          <label htmlFor="specialRequests">Requêtes spéciales (optionnel)</label>
          <textarea
            id="specialRequests"
            rows={3}
            value={formData.specialRequests}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            placeholder="Ex: besoin d'un vidéoprojecteur"
            className={errors.specialRequests ? 'input--error' : ''}
          />
          {errors.specialRequests && (
            <span className="error">{errors.specialRequests}</span>
          )}
        </div>

        {/* Erreur générale */}
        {errors.general && (
          <div className="form-error-general">{errors.general}</div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={resetForm} className="btn-secondary">
            Réinitialiser
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Calcul en cours...' : 'Continuer'}
          </button>
        </div>
      </form>
    </main>
  );
}
```

## Bonnes pratiques

### 1. Toujours gérer les erreurs

```tsx
{errors.fieldName && <span className="error">{errors.fieldName}</span>}
```

### 2. Désactiver le bouton pendant loading

```tsx
<button disabled={loading}>
  {loading ? 'En cours...' : 'Continuer'}
</button>
```

### 3. Parser les nombres correctement

```tsx
onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
```

### 4. Gérer l'erreur générale

```tsx
{errors.general && <div className="error-global">{errors.general}</div>}
```

### 5. Validation temps réel (optionnel)

```tsx
const handleBlurDate = () => {
  if (formData.date) {
    validateForm();
  }
};

<input onBlur={handleBlurDate} />
```

## Notes importantes

### Format des dates

**IMPORTANT:** Toujours utiliser des strings :
- Date : `YYYY-MM-DD` (ex: "2026-01-21")
- Heure : `HH:mm` (ex: "09:30")

Jamais de timestamps ISO ou Date objects dans formData.

### Gestion d'erreurs API

Les erreurs API sont automatiquement capturées et stockées dans `errors.general`.

### Type safety

Le hook est entièrement typé :
- Zéro `any` types
- Tous les paramètres et retours typés
- IntelliSense complet dans l'IDE

---

_Documentation créée le 2026-01-21_
