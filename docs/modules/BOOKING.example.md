# BOOKING Module - Architecture & Documentation

> **Module** : Booking (Réservations)
> **Apps** : site (public + dashboard), admin (gestion)
> **Status** : ✅ Production
> **Dernière mise à jour** : 2026-03-11

---

## 📋 Vue d'Ensemble

### Responsabilités

Le module Booking gère l'ensemble du cycle de vie des réservations :

1. **Réservation publique** : Formulaire multi-étapes, disponibilités, paiement Stripe
2. **Dashboard client** : Consultation, modification, annulation réservations
3. **Dashboard admin** : Gestion complète, calendrier, validation

### Flux Principal

```
User                Site                    Stripe              Admin
  │                  │                        │                  │
  ├─ Booking Form ──>│                        │                  │
  │                  ├─ Check Availability    │                  │
  │                  ├─ Calculate Price       │                  │
  │                  │                        │                  │
  ├─ Payment ───────>├─ Create Booking ──────>│                  │
  │                  │  (status: pending)     │                  │
  │                  │                        │                  │
  │                  │<─ Payment Success ─────┤                  │
  │                  ├─ Update Booking        │                  │
  │                  │  (status: confirmed)   │                  │
  │                  ├─ Send Email            │                  │
  │<─ Confirmation ──┤                        │                  │
  │                  │                        │                  │
  │                  │                        │<─ Admin Review ──┤
  │                  │                        │                  │
  │<─ Reminder ──────┤ (Cron: J-1)            │                  │
```

---

## 🗂️ Structure Fichiers

### apps/site/src/app/booking/

```
booking/
├── page.tsx (150L)                    # Page principale formulaire
├── confirmation/
│   └── page.tsx (100L)                # Page confirmation post-paiement
├── components/
│   ├── BookingForm.tsx (200L)         # Orchestration form multi-étapes
│   ├── Step1Space.tsx (180L)          # Sélection espace
│   ├── Step2DateTime.tsx (150L)       # Date & horaires
│   ├── Step3Services.tsx (120L)       # Services additionnels
│   ├── Step4Administrative.tsx (200L) # Infos admin
│   ├── Step5Summary.tsx (150L)        # Récapitulatif
│   └── PriceDisplay.tsx (80L)         # Affichage prix TTC
├── hooks/
│   ├── useBookingForm.ts (250L)       # Logique formulaire
│   ├── useAvailability.ts (150L)      # Check disponibilités
│   ├── usePriceCalculation.ts (120L)  # Calcul prix
│   └── useStripePayment.ts (100L)     # Intégration Stripe
└── types/
    └── booking.ts                     # Interfaces booking
```

### apps/admin/src/app/admin/booking/

```
admin/booking/
├── page.tsx (100L)                    # Dashboard bookings
├── calendar/
│   └── page.tsx (200L)                # Vue calendrier
├── reservations/
│   ├── page.tsx (150L)                # Liste réservations
│   └── [id]/
│       └── page.tsx (180L)            # Détail réservation
└── components/
    ├── BookingCalendar.tsx (200L)     # Calendrier admin
    ├── ReservationCard.tsx (100L)     # Card réservation
    └── ReservationDialog.tsx (180L)   # Modal détails
```

---

## 📊 Base de Données

### Collections MongoDB

```typescript
// Collection: booking-reservations (ou reservations si pas encore migré)
{
  _id: ObjectId,
  bookingNumber: "BK-2026-03-0042",      // Unique

  // Dates (ALWAYS strings)
  date: "2026-03-15",                     // YYYY-MM-DD
  startTime: "14:00",                     // HH:mm
  endTime: "18:00",                       // HH:mm

  // Space
  spaceId: ObjectId,
  spaceName: "Salle de Réunion 1",

  // Client
  userId: ObjectId,
  clientInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+33612345678",
    company: "Acme Inc"
  },

  // Pricing
  priceHT: 100,
  vat: 20,
  priceTTC: 120,
  currency: "EUR",

  // Services additionnels
  services: [
    {
      serviceId: ObjectId,
      name: "Café",
      quantity: 2,
      priceHT: 5,
      vat: 2
    }
  ],

  // Payment
  paymentStatus: "paid" | "pending" | "failed",
  paymentIntentId: "pi_xxx",              // Stripe Payment Intent
  stripeCustomerId: "cus_xxx",

  // Status
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show",

  // Metadata
  createdAt: "2026-03-11T10:30:00.000Z",
  updatedAt: "2026-03-11T10:30:00.000Z",
  cancelledAt?: "2026-03-12T09:00:00.000Z",
  cancellationReason?: string,

  // Admin
  adminNotes?: string,
  confirmedBy?: ObjectId,
  confirmedAt?: "2026-03-11T11:00:00.000Z"
}
```

### Indexes

```typescript
// Model: packages/database/src/models/Booking.ts
BookingSchema.index({ bookingNumber: 1 }, { unique: true });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ date: 1, spaceId: 1 });
BookingSchema.index({ status: 1, date: 1 });
BookingSchema.index({ paymentStatus: 1 });
```

---

## 🔌 API Routes

### Public Routes (apps/site)

#### POST /api/booking/check-availability

**Description** : Vérifie disponibilité espace pour date/heure

**Request** :
```typescript
{
  spaceId: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
}
```

**Response** :
```typescript
{
  available: boolean;
  conflictingBookings?: Booking[];
}
```

**Logique** :
```typescript
// Check overlapping bookings
const conflicts = await Booking.find({
  spaceId,
  date,
  status: { $in: ['pending', 'confirmed'] },
  $or: [
    { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
  ]
});

return { available: conflicts.length === 0 };
```

---

#### POST /api/booking/create

**Description** : Créer réservation (après paiement Stripe)

**Auth** : Optionnel (guest checkout possible)

**Request** :
```typescript
{
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  services: Array<{
    serviceId: string;
    quantity: number;
  }>;
  paymentIntentId: string;  // From Stripe
}
```

**Response** :
```typescript
{
  booking: Booking;
  bookingNumber: string;
}
```

**Workflow** :
```typescript
// 1. Verify payment intent
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
if (paymentIntent.status !== 'succeeded') {
  return errorResponse('Payment not confirmed', 400);
}

// 2. Check availability (double-check)
const conflicts = await checkAvailability(spaceId, date, startTime, endTime);
if (!conflicts.available) {
  // Refund payment
  await stripe.refunds.create({ payment_intent: paymentIntentId });
  return errorResponse('Space no longer available', 409);
}

// 3. Create booking
const booking = await Booking.create({
  bookingNumber: generateBookingNumber(),
  spaceId,
  date,
  startTime,
  endTime,
  clientInfo,
  services,
  paymentIntentId,
  paymentStatus: 'paid',
  status: 'confirmed',
  // ... other fields
});

// 4. Send confirmation email
await sendBookingConfirmation(booking);

return successResponse({ booking, bookingNumber: booking.bookingNumber }, 201);
```

---

#### GET /api/booking/[id]

**Description** : Récupérer détails réservation

**Auth** : Requis (user ou admin)

**Params** : `id` (booking _id ou bookingNumber)

**Response** :
```typescript
{
  booking: Booking;
}
```

**Sécurité** :
```typescript
// Users can only see their own bookings
if (userRole !== 'admin' && booking.userId.toString() !== userId) {
  return errorResponse('Unauthorized', 403);
}
```

---

### Admin Routes (apps/admin)

#### GET /api/admin/booking/list

**Description** : Liste réservations (filtres, pagination)

**Auth** : `requireAuth(['admin', 'dev'])`

**Query Params** :
```typescript
{
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  date?: string;           // Filter by date
  spaceId?: string;        // Filter by space
  page?: number;           // Pagination
  limit?: number;          // Default: 20
}
```

**Response** :
```typescript
{
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}
```

---

#### PATCH /api/admin/booking/[id]

**Description** : Mettre à jour réservation (admin)

**Auth** : `requireAuth(['admin', 'dev'])`

**Request** :
```typescript
{
  status?: 'confirmed' | 'cancelled';
  adminNotes?: string;
  // ... other updatable fields
}
```

**Response** :
```typescript
{
  booking: Booking;
}
```

---

## 🎨 Composants Clés

### BookingForm (apps/site)

**Responsabilité** : Orchestration formulaire multi-étapes

**Props** :
```typescript
interface BookingFormProps {
  // Pas de props (standalone)
}
```

**State** :
```typescript
const {
  currentStep,        // 1-5
  formData,           // BookingFormData
  errors,             // FormErrors
  loading,            // boolean
  nextStep,           // () => void
  prevStep,           // () => void
  submitBooking,      // () => Promise<void>
} = useBookingForm();
```

**Workflow** :
```typescript
<BookingForm>
  {currentStep === 1 && <Step1Space />}
  {currentStep === 2 && <Step2DateTime />}
  {currentStep === 3 && <Step3Services />}
  {currentStep === 4 && <Step4Administrative />}
  {currentStep === 5 && <Step5Summary />}
</BookingForm>
```

---

### useBookingForm Hook

**Responsabilité** : Logique formulaire (validation, state, API)

**Returns** :
```typescript
{
  currentStep: number;
  formData: BookingFormData;
  errors: FormErrors;
  loading: boolean;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (field: string, value: any) => void;
  submitBooking: () => Promise<void>;
}
```

**Validation** :
```typescript
function validateStep(step: number): boolean {
  switch (step) {
    case 1:
      return !!formData.spaceId;
    case 2:
      return !!formData.date && !!formData.startTime && !!formData.endTime;
    case 3:
      return true; // Services optional
    case 4:
      return !!formData.clientInfo.firstName &&
             !!formData.clientInfo.email &&
             validateEmail(formData.clientInfo.email);
    default:
      return false;
  }
}
```

---

## 💰 Intégration Stripe

### Workflow Paiement

```
1. User remplit formulaire → Step 5 Summary
2. Click "Payer" → Create Payment Intent
3. Stripe Checkout → User paie
4. Webhook Stripe → Payment succeeded
5. Create Booking → Status: confirmed
6. Send Email → Confirmation client
```

### Create Payment Intent

```typescript
// apps/site/src/app/api/booking/create-payment-intent/route.ts
export async function POST(request: NextRequest) {
  const { amount, currency, metadata } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,  // Cents
    currency: currency || 'eur',
    metadata: {
      spaceId: metadata.spaceId,
      date: metadata.date,
      userId: metadata.userId,
      // ... other metadata
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return successResponse({ clientSecret: paymentIntent.client_secret });
}
```

### Webhook Handler

```typescript
// apps/site/src/app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Create booking
    const booking = await Booking.create({
      // ... extract from paymentIntent.metadata
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    // Send email
    await sendBookingConfirmation(booking);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

## 📧 Emails

### Templates

```
@coworking-cafe/email/templates/
└── booking/
    ├── confirmation.tsx        # Confirmation client
    ├── reminder.tsx            # Rappel J-1
    ├── cancellation.tsx        # Annulation
    └── admin-notification.tsx  # Notification admin
```

### Confirmation Email

```typescript
// packages/email/src/templates/booking/confirmation.tsx
export function BookingConfirmationEmail({ booking }: Props) {
  return (
    <Email>
      <Header>Réservation confirmée</Header>
      <Body>
        <p>Bonjour {booking.clientInfo.firstName},</p>
        <p>Votre réservation a été confirmée !</p>

        <Box>
          <strong>Numéro de réservation :</strong> {booking.bookingNumber}
          <strong>Date :</strong> {formatDate(booking.date)}
          <strong>Horaire :</strong> {booking.startTime} - {booking.endTime}
          <strong>Espace :</strong> {booking.spaceName}
          <strong>Prix TTC :</strong> {booking.priceTTC}€
        </Box>

        <Button href={`${SITE_URL}/dashboard/bookings/${booking._id}`}>
          Voir ma réservation
        </Button>
      </Body>
    </Email>
  );
}
```

---

## ⏰ Cron Jobs

### Rappels J-1

```typescript
// apps/site/src/app/api/cron/send-reminders/route.ts
export async function GET(request: NextRequest) {
  // Auth cron (Vercel secret)
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  // Find bookings for tomorrow
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = formatDate(tomorrow, 'yyyy-MM-dd');

  const bookings = await Booking.find({
    date: tomorrowStr,
    status: 'confirmed',
    reminderSent: { $ne: true }
  });

  // Send reminders
  for (const booking of bookings) {
    await sendBookingReminder(booking);
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { reminderSent: true } }
    );
  }

  return successResponse({
    sent: bookings.length,
    date: tomorrowStr
  });
}
```

**Config Vercel** :
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"  // Tous les jours à 10h UTC
    }
  ]
}
```

---

## 🧪 Tests

### Tests Unitaires (à créer)

```typescript
// tests/booking/usePriceCalculation.test.ts
describe('usePriceCalculation', () => {
  it('should calculate price with VAT correctly', () => {
    const { result } = renderHook(() => usePriceCalculation({
      basePrice: 100,
      services: [{ priceHT: 10, quantity: 2 }],
      vat: 0.20
    }));

    expect(result.current.totalHT).toBe(120);  // 100 + (10 * 2)
    expect(result.current.totalTTC).toBe(144); // 120 * 1.20
  });
});
```

### Tests E2E (à créer)

```typescript
// e2e/booking-flow.spec.ts
test('user can complete booking', async ({ page }) => {
  await page.goto('/booking');

  // Step 1: Select space
  await page.click('text=Salle de Réunion 1');
  await page.click('button:has-text("Suivant")');

  // Step 2: Select date/time
  await page.fill('[name="date"]', '2026-03-15');
  await page.selectOption('[name="startTime"]', '14:00');
  await page.selectOption('[name="endTime"]', '18:00');
  await page.click('button:has-text("Suivant")');

  // Step 3: Services (skip)
  await page.click('button:has-text("Suivant")');

  // Step 4: Client info
  await page.fill('[name="firstName"]', 'John');
  await page.fill('[name="lastName"]', 'Doe');
  await page.fill('[name="email"]', 'john@example.com');
  await page.click('button:has-text("Suivant")');

  // Step 5: Summary & Payment
  await expect(page.locator('text=120€ TTC')).toBeVisible();
  await page.click('button:has-text("Payer")');

  // Mock Stripe payment
  // ...

  // Verify confirmation
  await expect(page.locator('text=Réservation confirmée')).toBeVisible();
});
```

---

## 🐛 Troubleshooting

### Problème : Booking créé mais email non envoyé

**Cause** : Erreur SMTP après création booking

**Solution** :
```typescript
// Séparer création booking et email
// 1. Create booking
const booking = await Booking.create({ ... });

// 2. Try send email (avec retry)
try {
  await sendBookingConfirmation(booking);
} catch (error) {
  // Log error mais ne pas rollback booking
  console.error('Email failed:', error);
  // TODO: Retry via cron job
}
```

---

### Problème : Double booking (race condition)

**Cause** : 2 users réservent simultanément

**Solution** : Utiliser MongoDB transactions
```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Check availability (avec lock)
  const conflicts = await Booking.find({ ... }).session(session);

  if (conflicts.length > 0) {
    throw new Error('Not available');
  }

  // 2. Create booking (dans transaction)
  const booking = await Booking.create([{ ... }], { session });

  await session.commitTransaction();
  return booking;

} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 📝 TODO / Améliorations Futures

- [ ] Système de waitlist (si espace complet)
- [ ] Booking récurrents (hebdomadaire, mensuel)
- [ ] Facturation automatique (PDF)
- [ ] Intégration calendrier (Google Calendar, iCal)
- [ ] SMS reminders (Twilio)
- [ ] Review system (après booking)
- [ ] Loyalty program (points)

---

## 📚 Ressources

- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)

---

**Dernière mise à jour** : 2026-03-11
**Mainteneur** : Thierry
**Version** : 1.0
