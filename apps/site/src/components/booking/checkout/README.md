# Checkout Components

Composants modulaires pour la page de paiement checkout.

---

## 📦 Exports

```typescript
import {
  CheckoutHeader,
  BookingSummary,
  PaymentInfo,
  CheckoutActions,
  CheckoutLoading,
  CheckoutError,
  useCheckout,
} from '@/components/booking/checkout';
```

---

## 🧩 Composants

### CheckoutHeader

**Usage** : Navigation et progress bar

```tsx
<CheckoutHeader onBack={() => router.back()} />
```

**Props** :
- `onBack: () => void` - Callback bouton retour

**Contenu** :
- BookingProgressBar (étape 4)
- Breadcrumb + titre "Paiement sécurisé"

---

### BookingSummary

**Usage** : Résumé de la réservation

```tsx
<BookingSummary
  booking={booking}
  spaceConfig={spaceConfig}
/>
```

**Props** :
- `booking: Booking` - Détails réservation
- `spaceConfig: SpaceConfig | null` - Config espace

**Affiche** :
- Nom espace + type
- Date (format français long)
- Horaires
- Nombre personnes
- Prix total

---

### PaymentInfo

**Usage** : Formulaire paiement Stripe

```tsx
<PaymentInfo
  stripePromise={stripePromise}
  bookingId={bookingId}
  amount={totalPrice * 100}
  intentType="manual_capture"
  clientSecret={clientSecret}
/>
```

**Props** :
- `stripePromise: Promise<Stripe | null> | null` - Stripe instance
- `bookingId: string` - ID réservation
- `amount: number` - Montant en centimes
- `intentType: 'setup_intent' | 'manual_capture'` - Type intent
- `clientSecret: string` - Client secret Stripe

**Intègre** :
- Stripe Elements
- CheckoutForm

---

### CheckoutActions

**Usage** : Informations sécurité

```tsx
<CheckoutActions />
```

**Props** : Aucune (composant statique)

**Affiche** :
- Badge "Paiement 100% sécurisé"
- Icônes SSL, Stripe, PCI DSS

---

### CheckoutLoading

**Usage** : État de chargement

```tsx
if (loading) return <CheckoutLoading />;
```

**Props** : Aucune

**Affiche** :
- Spinner Bootstrap
- Message "Préparation du paiement..."

---

### CheckoutError

**Usage** : État d'erreur

```tsx
if (error) {
  return (
    <CheckoutError
      error={error}
      onReturnToSpaces={() => router.push('/booking')}
    />
  );
}
```

**Props** :
- `error: string` - Message d'erreur
- `onReturnToSpaces: () => void` - Callback bouton retour

**Affiche** :
- Alert Bootstrap danger
- Bouton retour aux espaces

---

## 🪝 Hook

### useCheckout

**Usage** : Logique métier checkout

```tsx
const {
  booking,
  spaceConfig,
  clientSecret,
  intentType,
  loading,
  error,
} = useCheckout({
  bookingId: params.bookingId,
  sessionStatus: status,
});
```

**Props** :
- `bookingId: string` - ID réservation
- `sessionStatus: 'loading' | 'authenticated' | 'unauthenticated'` - État session

**Return** :
- `booking: Booking | null` - Détails réservation
- `spaceConfig: SpaceConfig | null` - Config espace
- `clientSecret: string | null` - Client secret Stripe
- `intentType: 'setup_intent' | 'manual_capture' | null` - Type intent
- `loading: boolean` - État chargement
- `error: string | null` - Message erreur

**Fonctionnalités** :
- Fetch booking details
- Fetch space configuration
- Création payment intent
- Redirections automatiques (paid, cancelled, no payment required)
- Gestion états (loading, error)

---

## 📝 Types

```typescript
interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  requiresPayment: boolean;
}

interface SpaceConfig {
  name: string;
  spaceType: string;
}
```

---

## 🎯 Exemple Complet

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import {
  CheckoutHeader,
  BookingSummary,
  PaymentInfo,
  CheckoutActions,
  CheckoutLoading,
  CheckoutError,
  useCheckout,
} from '@/components/booking/checkout';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ params }) {
  const router = useRouter();
  const { status } = useSession();

  const {
    booking,
    spaceConfig,
    clientSecret,
    intentType,
    loading,
    error,
  } = useCheckout({
    bookingId: params.bookingId,
    sessionStatus: status,
  });

  if (loading) return <CheckoutLoading />;
  if (error) return <CheckoutError error={error} onReturnToSpaces={() => router.push('/booking')} />;
  if (!booking || !clientSecret) return null;

  return (
    <section className="checkout-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <CheckoutHeader onBack={() => router.back()} />
            <BookingSummary booking={booking} spaceConfig={spaceConfig} />
            <PaymentInfo
              stripePromise={stripePromise}
              bookingId={params.bookingId}
              amount={Math.round(booking.totalPrice * 100)}
              intentType={intentType || 'manual_capture'}
              clientSecret={clientSecret}
            />
            <CheckoutActions />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 📏 Taille Fichiers

| Fichier | Lignes | Status |
|---------|--------|--------|
| page.tsx | 91 | ✅ < 200 |
| useCheckout.ts | 133 | ✅ < 200 |
| BookingSummary.tsx | 109 | ✅ < 200 |
| PaymentInfo.tsx | 49 | ✅ < 200 |
| CheckoutError.tsx | 32 | ✅ < 200 |
| CheckoutHeader.tsx | 31 | ✅ < 200 |
| CheckoutActions.tsx | 26 | ✅ < 200 |
| CheckoutLoading.tsx | 16 | ✅ < 200 |
| index.ts | 7 | ✅ < 200 |

**Total** : 494 lignes (vs 343 avant refacto)

---

## ✅ Conformité CLAUDE.md

- [x] Zéro `any` types
- [x] Props TypeScript strictes
- [x] Fichiers < 200 lignes
- [x] Composants réutilisables
- [x] Logique extraite en hook
- [x] Nommage cohérent
- [x] Early returns pour states

---

## 🔗 Documentation

- [CHECKOUT_REFACTORING.md](../../../docs/refactoring/CHECKOUT_REFACTORING.md) - Historique refacto
- [CLAUDE.md Site](../../../CLAUDE.md) - Conventions site
- [Stripe Integration](../../../docs/features/STRIPE_INTEGRATION.md)

---

**Dernière mise à jour** : 2026-02-08
