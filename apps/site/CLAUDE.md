# CLAUDE.md - Site App Development Guide

> **App** : `/apps/site/` - Site Public + Dashboard Client du CoworKing Café
> **Date de création** : 2026-01-21
> **Version** : 4.0 - Refactorisation Progressive
> **Status** : ✅ Code fonctionnel - En phase de tests puis refactorisation

---

## ⚠️ STRUCTURE DU PROJET - IMPORTANT

```
/Users/twe/Developer/Thierry/coworking-cafe/
│
├── source/                          # ✅ CODE ORIGINAL (référence)
│   └── src/app/(site)/              # Code fonctionnel de référence
│
└── coworking-cafe/                  # Monorepo actif
    ├── apps/
    │   ├── admin/                   # Dashboard admin (Tailwind + shadcn/ui)
    │   └── site/
    │       ├── src/                 # ✅ CODE FONCTIONNEL ACTUEL
    │       │                        # (anciennement src-old/, copié tel quel)
    │       └── src-old/             # 📦 Backup (identique à src/)
    ├── packages/database/           # ✅ Models partagés Mongoose
    └── docs/                        # Documentation
```

**RÈGLES ACTUELLES** :
- **Code actif** : `src/` = Code fonctionnel, prêt à refactoriser progressivement
- **Référence** : `/source/` (en cas de doute sur une fonctionnalité)
- **Approche** : Tests d'abord → Refactorisation progressive → Pas de réécriture complète
- **Stabilité** : Ne rien casser, améliorer progressivement

---

## 📋 Table des Matières

**📌 IMPORTANT : TENIR À JOUR TODO.md + /PROGRESS.md**
- ✅ Cocher les tâches terminées dans `TODO.md` après chaque étape
- ✅ Mettre à jour le % de progression dans `TODO.md` (résumé)
- ✅ Mettre à jour `/PROGRESS.md` à la fin de chaque phase
- ✅ Commit réguliers avec référence aux tâches terminées

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Monorepo](#architecture-monorepo)
3. [Stack Technique](#stack-technique)
4. [Structure Détaillée](#structure-détaillée)
5. [Models Partagés](#models-partagés)
6. [Conventions de Code Strictes](#conventions-de-code-strictes)
7. [SEO Best Practices](#seo-best-practices)
8. [Workflow Booking Complet](#workflow-booking-complet)
9. [Intégration Stripe](#intégration-stripe)
10. [Blog System](#blog-system)
11. [Dashboard Client](#dashboard-client)
12. [Phase de Tests et Refactorisation](#phase-de-tests-et-refactorisation)
13. [Checklist Avant Prod](#checklist-avant-prod)
14. [FAQ](#faq)

---

## 🎯 1. Vue d'ensemble

### Qu'est-ce que apps/site ?

Cette app Next.js 14 (App Router) contient **DEUX parties distinctes** :

#### 🌐 Site Public
- **Homepage** : Présentation du CoworKing Café
- **Concept** : Notre approche Anticafé
- **Espaces** : Présentation des espaces (open-space, salles)
- **Tarifs** : Grilles tarifaires
- **Offres étudiants** : Tarifs étudiants
- **Programme fidélité** : Avantages membres
- **Blog** : Articles (affichage public, CMS dans admin)
- **Contact** : Formulaire contact
- **Legal** : Mentions légales, CGU, confidentialité

#### 📅 Système de Réservation Public
- **Booking flow** : 6 étapes (sélection → paiement → confirmation)
- **Paiement Stripe** : Payment Intent + webhooks
- **Confirmation email** : Après paiement réussi

#### 👤 Dashboard Client
- **Mes réservations** : Historique, annulation
- **Mon profil** : Informations personnelles
- **Messagerie** : Communication avec le staff
- **Paramètres** : Préférences utilisateur

### Distinction avec apps/admin

| Fonctionnalité | Site (apps/site) | Admin (apps/admin) |
|----------------|------------------|-------------------|
| **Site public** | ✅ Pages marketing, blog | ❌ Non |
| **Réservations publiques** | ✅ Booking client | ❌ Non |
| **Dashboard client** | ✅ Mes réservations, profil | ❌ Non |
| **Gestion HR** | ❌ Non | ✅ Employés, planning, pointage |
| **Gestion booking** | ❌ Non (vue client seulement) | ✅ Toutes les réservations |
| **Blog CMS** | ❌ Non (affichage seulement) | ✅ Création/édition articles |
| **Comptabilité** | ❌ Non | ✅ Caisse, CA |
| **Stack** | Bootstrap + SCSS | Tailwind + shadcn/ui |
| **Rôles** | `client` | `dev`, `admin`, `staff` |

---

## 🏢 2. Architecture Monorepo

### Rôles Système vs Rôles Métier

**⚠️ DISTINCTION IMPORTANTE** :

#### Rôles Système (NextAuth - `user.role`)
Ces rôles contrôlent **l'accès aux apps** :

| Rôle | Accès | Description |
|------|-------|-------------|
| `dev` | Admin app (full) | Développeur (tout accès) |
| `admin` | Admin app (full) | Administrateur système |
| `staff` | Admin app (limité) | Employé (lecture HR/Planning) |
| `client` | Site dashboard | Client standard (réservations) |

#### Rôles Métier (Employee - `employee.employeeRole`)
Ces rôles définissent **la fonction métier** (uniquement pour staff) :

| Rôle Métier | Description |
|-------------|-------------|
| `Manager` | Responsable d'équipe |
| `Assistant manager` | Responsable adjoint |
| `Employé polyvalent` | Employé standard |

**Exemple concret** :
```typescript
// User dans la DB
{
  email: "marie@coworkingcafe.fr",
  role: "staff",              // ← Rôle système (accès admin app)
  employee: {
    employeeRole: "Manager",  // ← Rôle métier (fonction)
    salary: 2500,
    hireDate: "2025-01-15"
  }
}
```

### Models Partagés (packages/database)

**RÈGLE** : Tous les models MongoDB sont centralisés dans `/packages/database/src/models/`

**Models disponibles** :
- ✅ `User` - Utilisateurs (clients + staff)
- ✅ `Role` - Rôles système
- ✅ `Permission` - Permissions
- ✅ `Session` - Sessions NextAuth
- ✅ `Booking` - Réservations
- ✅ `Space` - Espaces coworking
- ✅ `SpaceConfiguration` - Config espaces
- ✅ `Payment` - Paiements
- ✅ `Article` - Articles blog
- ✅ `Category` - Catégories blog
- ✅ `Comment` - Commentaires blog
- ✅ `Conversation` - Conversations
- ✅ `Message` - Messages
- ✅ `ContactMail` - Formulaires contact
- ✅ `Newsletter` - Abonnés newsletter
- ✅ `PromoConfig` - Codes promo
- ✅ `GlobalHours` - Horaires d'ouverture
- ✅ `MenuCategory` / `MenuItem` - Menu take-away

**Import depuis packages** :
```typescript
import { User, Booking, Article } from '@coworking-cafe/database';
import type { UserDocument, BookingDocument } from '@coworking-cafe/database';
```

### Stripe Partagé

**Librairie Stripe centralisée** dans `packages/database/lib/stripe.ts` :

```typescript
// Import depuis package
import { stripe } from '@coworking-cafe/database';

// Créer Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // 50€ en centimes
  currency: 'eur',
  metadata: { bookingId: '123' }
});
```

### Séparation des Responsabilités

```
┌─────────────────────────────────────────────────────────┐
│                     MONOREPO ROOT                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📦 packages/                                            │
│  ├── database/         ← Models, Stripe, MongoDB        │
│  ├── email/            ← Templates emails               │
│  └── shared/           ← Utilitaires communs            │
│                                                           │
│  📱 apps/                                                │
│  ├── site/             ← Site public + Dashboard client │
│  │   ├── Pages marketing                                │
│  │   ├── Booking public                                 │
│  │   ├── Blog (affichage)                               │
│  │   └── Dashboard client                               │
│  │                                                        │
│  └── admin/            ← Dashboard admin                │
│      ├── HR (employés, planning, pointage)             │
│      ├── Comptabilité (caisse, CA)                     │
│      ├── Blog CMS (création/édition)                   │
│      └── Gestion réservations (toutes)                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 2.5. SÉCURITÉ - Règles Critiques (TOUT LE PROJET)

**⚠️ JAMAIS DE SECRETS EN DUR DANS LES FICHIERS .md OU CODE**

### Règles Strictes

```typescript
// ❌ INTERDIT - Secrets en dur
const mongoUri = "mongodb+srv://admin:G4mgKEL...@cluster.mongodb.net/db"
const stripeKey = "sk_live_51ABC..."

// ❌ INTERDIT - Dans documentation
/**
 * MONGODB_URI=mongodb+srv://admin:REAL_PASSWORD@cluster.mongodb.net/db
 */

// ✅ CORRECT - Variables d'environnement
const mongoUri = process.env.MONGODB_URI!
const stripeKey = process.env.STRIPE_SECRET_KEY!

// ✅ CORRECT - Placeholders dans docs
/**
 * MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE
 */
```

**Checklist avant commit** :
- [ ] Aucun secret en dur dans le code
- [ ] Placeholders génériques dans les .md
- [ ] Fichiers .md dans `/docs/` uniquement (sauf README, CLAUDE)
- [ ] Pre-commit hook vérifie automatiquement

**Voir** : `/CLAUDE.md` (racine) section "🔒 SÉCURITÉ" pour la liste complète des règles.

---

## 🛠️ 3. Stack Technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14+ | App Router, Server Components |
| **TypeScript** | 5+ | Strict mode, 0 `any` types |
| **Bootstrap** | 5.3 | CSS Framework |
| **SCSS** | - | Styles (BEM modifié) |
| **React** | 18+ | UI Components |
| **Redux Toolkit** | - | State management (optionnel) |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js API Routes** | 14+ | Backend APIs |
| **NextAuth.js** | 4+ | Authentification |
| **MongoDB** | 6+ | Base de données |
| **Mongoose** | 8+ | ODM MongoDB |
| **Stripe** | - | Paiements |

### Outils

| Outil | Usage |
|-------|-------|
| **pnpm** | Package manager monorepo |
| **ESLint** | Linting TypeScript |
| **Prettier** | Formatage code |

### Variables d'Environnement

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/coworking-cafe
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📂 4. Structure Détaillée

### Vue d'ensemble

```
/apps/site/
├── src/                           # ✨ CODE PROPRE (à réécrire depuis /source)
├── src-old/                       # ⚠️ ANCIEN CODE MODIFIÉ (ne pas utiliser)
├── public/                        # Assets statiques
├── docs/                          # Documentation
├── CLAUDE.md                      # Ce fichier
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local
```

### Structure src/ (À créer)

```
src/
├── app/                           # Next.js App Router
│   ├── (site)/                    # 🌐 Site public (layout site)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home
│   │   ├── concept/
│   │   ├── spaces/
│   │   ├── pricing/
│   │   ├── student-offers/
│   │   ├── members-program/
│   │   ├── blog/
│   │   │   ├── page.tsx           # Liste
│   │   │   ├── [slug]/            # Détail
│   │   │   └── category/[slug]/
│   │   ├── booking/               # Booking public
│   │   │   ├── page.tsx           # Step 1: Form
│   │   │   ├── confirmation/      # Step 2: Recap
│   │   │   ├── checkout/          # Step 3: Payment
│   │   │   └── success/           # Step 4: Success
│   │   ├── menu/                  # Menu take-away
│   │   ├── contact/
│   │   ├── horaires/
│   │   ├── history/
│   │   ├── boissons/
│   │   ├── food/
│   │   ├── mentions-legales/
│   │   ├── politique-confidentialite/
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/
│   │       ├── forgot-password/
│   │       └── reset-password/
│   │
│   ├── dashboard/                 # 👤 Dashboard client
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Overview
│   │   ├── bookings/              # Mes réservations
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── profile/
│   │   ├── messages/
│   │   └── settings/
│   │
│   └── api/                       # API Routes
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── booking/
│       │   ├── route.ts           # GET, POST
│       │   ├── [id]/route.ts      # GET, PUT, DELETE
│       │   └── availability/route.ts
│       ├── spaces/route.ts
│       ├── menu/route.ts
│       ├── contact/route.ts
│       ├── newsletter/route.ts
│       ├── promo/route.ts
│       ├── blog/
│       │   ├── route.ts
│       │   ├── [slug]/route.ts
│       │   └── categories/route.ts
│       └── stripe/
│           └── webhook/route.ts
│
├── components/                    # Composants React
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Breadcrumb.tsx
│   ├── ui/                        # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── DatePicker.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   ├── booking/
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingCard.tsx
│   │   ├── BookingSummary.tsx
│   │   ├── TimeSlotSelector.tsx
│   │   └── PaymentForm.tsx
│   ├── spaces/
│   │   ├── SpaceCard.tsx
│   │   ├── SpaceDetails.tsx
│   │   └── SpaceGallery.tsx
│   ├── menu/
│   │   ├── MenuCategory.tsx
│   │   ├── MenuItem.tsx
│   │   └── CartWidget.tsx
│   ├── blog/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleList.tsx
│   │   ├── ArticleContent.tsx
│   │   └── CommentSection.tsx
│   ├── dashboard/
│   │   ├── DashboardNav.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── BookingHistory.tsx
│   │   └── ProfileForm.tsx
│   └── shared/
│       ├── Hero.tsx
│       ├── Section.tsx
│       └── ContactForm.tsx
│
├── hooks/                         # Custom Hooks
│   ├── useBooking.ts
│   ├── useSpaces.ts
│   ├── useMenu.ts
│   ├── useBlog.ts
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── useCart.ts
│
├── lib/                           # Utilitaires
│   ├── api/
│   │   ├── auth.ts
│   │   ├── response.ts
│   │   └── validation.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── email/
│   │   ├── bookingConfirmation.ts
│   │   └── contactConfirmation.ts
│   └── utils/
│       ├── format-date.ts
│       ├── format-price.ts
│       ├── validation.ts
│       └── slugify.ts
│
├── types/                         # Types TypeScript
│   ├── booking.ts
│   ├── space.ts
│   ├── menu.ts
│   ├── blog.ts
│   ├── user.ts
│   ├── promo.ts
│   └── api.ts
│
├── styles/                        # SCSS
│   ├── bootstrap/
│   │   ├── _variables.scss
│   │   ├── _custom.scss
│   │   └── bootstrap.scss
│   ├── base/
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   └── _utilities.scss
│   ├── components/
│   │   ├── _button.scss
│   │   ├── _card.scss
│   │   ├── _modal.scss
│   │   └── _form.scss
│   ├── layout/
│   │   ├── _header.scss
│   │   ├── _footer.scss
│   │   └── _navigation.scss
│   ├── pages/
│   │   ├── _home.scss
│   │   ├── _booking.scss
│   │   ├── _spaces.scss
│   │   ├── _blog.scss
│   │   └── _dashboard.scss
│   └── main.scss
│
└── store/                         # Redux Toolkit (optionnel)
    ├── index.ts
    ├── slices/
    │   ├── authSlice.ts
    │   ├── bookingSlice.ts
    │   └── cartSlice.ts
    └── hooks.ts
```

### ⚠️ Structure src-old/ (NE PAS UTILISER)

**IMPORTANT** : `src-old/` n'est PAS le code original. C'est l'ancien code qui a été modifié pour extraire apps/admin.

**Code original** : `/source/src/app/(site)/` (un niveau au-dessus du monorepo)

```
src-old/
├── app/                           # Ancien code (bugs, any types)
├── components/                    # Anciens composants (ne pas copier)
├── models/                        # ⚠️ À migrer vers packages/database
├── lib/                           # Helpers (à réutiliser)
├── types/                         # Types (à adapter)
├── hooks/                         # Hooks (à réutiliser)
└── assets/                        # SCSS, images (à trier)
```

**⚠️ IMPORTANT** :
- **Source de référence** : `/source/src/app/(site)/` (code original fonctionnel)
- **Ne PAS utiliser** : `src-old/` (code modifié, bugs)
- **Workflow** : Analyser `/source/` → Comprendre → Réécrire dans `src/`

---

## 📦 5. Models Partagés (packages/database)

### Importer les Models

```typescript
// Import models
import {
  User,
  Booking,
  Space,
  Article,
  Category,
  Comment,
  Conversation,
  Message,
  Payment,
  PromoConfig,
  ContactMail,
  Newsletter
} from '@coworking-cafe/database';

// Import types
import type {
  UserDocument,
  BookingDocument,
  SpaceDocument,
  ArticleDocument
} from '@coworking-cafe/database';
```

### Models Principaux

#### User

```typescript
interface UserDocument {
  _id: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: 'dev' | 'admin' | 'staff' | 'client'
  employee?: {
    employeeRole: 'Manager' | 'Assistant manager' | 'Employé polyvalent'
    hireDate: Date
    salary: number
    department: string
  }
  createdAt: Date
  updatedAt: Date
}
```

#### Booking

```typescript
interface BookingDocument {
  _id: ObjectId
  userId: ObjectId
  spaceId: ObjectId
  date: string              // YYYY-MM-DD
  startTime: string         // HH:mm
  endTime: string           // HH:mm
  numberOfPeople: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  paymentIntentId?: string
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Space

```typescript
interface SpaceDocument {
  _id: ObjectId
  name: string
  description: string
  type: 'open-space' | 'meeting-room' | 'private-office'
  capacity: number
  pricePerHour: number
  amenities: string[]
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Article

```typescript
interface ArticleDocument {
  _id: ObjectId
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  authorId: ObjectId
  categoryId: ObjectId
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  views: number
  createdAt: Date
  updatedAt: Date
}
```

### Utiliser les Models dans une API Route

```typescript
// app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Booking, User } from '@coworking-cafe/database';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Utiliser le model
  const bookings = await Booking.find({ userId: session.user.id })
    .populate('spaceId', 'name type')
    .sort({ date: -1 });

  return NextResponse.json({ success: true, data: bookings });
}
```

---

## ✅ 6. Conventions de Code Strictes

### 1. TypeScript - ZÉRO `any`

**RÈGLE ABSOLUE** : Aucun `any` type dans le code

```typescript
// ❌ INTERDIT
function processData(data: any) {
  return data.map((item: any) => item.id);
}

const result: any = await fetch('/api/bookings');

// ✅ CORRECT
interface Booking {
  id: string
  userId: string
  date: string
}

function processData(data: Booking[]): string[] {
  return data.map((item) => item.id);
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const result: ApiResponse<Booking[]> = await fetch('/api/bookings').then(r => r.json());
```

**Exceptions autorisées** (avec justification documentée) :
```typescript
// Cas rare : librairie externe sans types
// @ts-expect-error - Librairie legacy-lib sans types disponibles
import { legacyFunction } from 'legacy-lib';
```

### 2. Formats de Dates - TOUJOURS des Strings

**RÈGLE** : Dates et heures en format string pour éviter les bugs de timezone

```typescript
// ❌ INTERDIT - Timestamps ISO
interface Booking {
  date: Date                          // ❌ Bugs timezone
  startTime: Date                     // ❌
  createdAt: string                   // ❌ Incohérent
}

const booking = {
  date: new Date("2026-01-21T00:00:00.000Z"),  // ❌
  startTime: "09:00"                           // ❌ Mixte
};

// ✅ CORRECT - Strings partout
interface Booking {
  date: string              // YYYY-MM-DD
  startTime: string         // HH:mm
  endTime: string           // HH:mm
  createdAt: Date           // Timestamps audit OK
  updatedAt: Date           // Timestamps audit OK
}

const booking: Booking = {
  date: "2026-01-21",
  startTime: "09:00",
  endTime: "17:30",
  createdAt: new Date(),
  updatedAt: new Date()
};
```

**Helpers Date/Time** :

```typescript
// lib/utils/format-date.ts

/**
 * Formater Date → String YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formater Date → String HH:mm
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Parser String YYYY-MM-DD → Date
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Parser Date + Time → Date
 */
export function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

/**
 * Calculer différence en heures
 */
export function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}
```

### 3. Taille des Fichiers

| Type | Max lignes | Action si dépassé |
|------|------------|-------------------|
| **Composants React** | 200 | Extraire sous-composants ou hooks |
| **Custom Hooks** | 250 | Séparer en hooks spécialisés |
| **Pages Next.js** | 150 | Logique → hooks, UI → composants |
| **API Routes** | 200 | Extraire validation/logique |
| **Utils/Helpers** | 200 | Découper par responsabilité |
| **SCSS** | 300 | Découper en partials |

**Exemple de découpage** :

```typescript
// ❌ MAUVAIS - BookingPage.tsx (400 lignes)
export function BookingPage() {
  // 100 lignes de state
  // 100 lignes de handlers
  // 100 lignes de validation
  // 100 lignes de JSX
}

// ✅ BON - Découpage propre

// hooks/useBookingForm.ts (120 lignes)
export function useBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({...});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    // Validation logic
  };

  const handleSubmit = async () => {
    // Submit logic
  };

  return { formData, errors, loading, validateForm, handleSubmit };
}

// components/booking/BookingForm.tsx (80 lignes)
export function BookingForm() {
  const { formData, errors, loading, handleSubmit } = useBookingForm();

  return (
    <form onSubmit={handleSubmit} className="booking__form">
      <SpaceSelector />
      <DateTimePicker />
      <BookingSummary />
      <PaymentSection />
    </form>
  );
}

// components/booking/SpaceSelector.tsx (60 lignes)
// components/booking/DateTimePicker.tsx (70 lignes)
// components/booking/BookingSummary.tsx (50 lignes)
// components/booking/PaymentSection.tsx (80 lignes)
```

### 4. Nommage SCSS - BEM Modifié

**Convention stricte** :

```scss
// ✅ BON - BEM modifié avec préfixe
.page-home__hero { }
.page-home__hero-title { }
.page-home__hero-title--highlighted { }
.page-home__hero-cta { }

.booking__form { }
.booking__form-header { }
.booking__form-field { }
.booking__form-field--error { }

.card { }
.card--primary { }
.card__header { }
.card__header-title { }
.card__body { }
.card__footer { }

// ❌ MAUVAIS
.heroOne { }              // camelCase
.hero-one { }             // Pas de contexte
.hero_title { }           // Un seul underscore
.card1 { }                // Numérotation
.formError { }            // Pas de hiérarchie
```

**Règles** :
- ✅ `.block` ou `.page-name__block`
- ✅ `.block__element` ou `.page-name__block-element`
- ✅ `.block--modifier` ou `.page-name__block--modifier`
- ✅ Tirets pour séparer mots multiples
- ✅ Double underscore pour hiérarchie
- ✅ Double tiret pour modificateurs
- ❌ Pas de camelCase
- ❌ Pas d'underscore simple
- ❌ Pas de numérotation

**Exemples concrets** :

```scss
// styles/pages/_home.scss
.page-home {
  &__hero { }
  &__hero-title { }
  &__hero-subtitle { }
  &__hero-cta { }

  &__about { }
  &__about-content { }
  &__about-image { }

  &__services { }
  &__services-grid { }
  &__services-item { }
  &__services-item-icon { }
  &__services-item-title { }
}

// styles/pages/_booking.scss
.page-booking {
  &__container { }
  &__header { }
  &__header-title { }

  &__form { }
  &__form-step { }
  &__form-step--active { }
  &__form-field { }
  &__form-field--error { }
  &__form-actions { }
  &__form-actions-btn { }
}

// styles/components/_card.scss
.card {
  &--primary { }
  &--secondary { }
  &--outlined { }

  &__header { }
  &__header-title { }
  &__header-actions { }

  &__body { }
  &__body-text { }

  &__footer { }
  &__footer-actions { }
}
```

### 5. Composants Réutilisables avec Children

**Principe** : Composants flexibles plutôt que duplication

```tsx
// ❌ MAUVAIS - Duplication
// components/home/HeroOne.tsx
export function HeroOne() {
  return (
    <section className="hero hero--one">
      <h1>Titre HeroOne</h1>
      <p>Contenu HeroOne</p>
    </section>
  );
}

// components/home/HeroTwo.tsx
export function HeroTwo() {
  return (
    <section className="hero hero--two">
      <h1>Titre HeroTwo</h1>
      <p>Contenu HeroTwo</p>
    </section>
  );
}

// ✅ BON - Composant flexible unique
// components/shared/Hero.tsx
interface HeroProps {
  variant?: 'default' | 'full' | 'split'
  title?: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}

export function Hero({
  variant = 'default',
  title,
  subtitle,
  className,
  children
}: HeroProps) {
  return (
    <section className={cn('hero', `hero--${variant}`, className)}>
      {title && <h1 className="hero__title">{title}</h1>}
      {subtitle && <p className="hero__subtitle">{subtitle}</p>}
      <div className="hero__content">
        {children}
      </div>
    </section>
  );
}

// Usage
<Hero variant="full" title="Bienvenue" subtitle="Au CoworKing Café">
  <Button>Réserver maintenant</Button>
</Hero>

<Hero variant="split">
  <div className="custom-layout">
    <CustomComponent />
  </div>
</Hero>
```

**Pattern Card avec composition** :

```typescript
// components/ui/Card.tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'filled'
  className?: string
  children: React.ReactNode
}

export function Card({ variant = 'default', className, children }: CardProps) {
  return (
    <div className={cn('card', `card--${variant}`, className)}>
      {children}
    </div>
  );
}

// Sub-components
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card__footer">{children}</div>;
};

// Usage
<Card variant="outlined">
  <Card.Header>
    <h3>Mon titre</h3>
  </Card.Header>
  <Card.Body>
    <p>Contenu de la card</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### 6. Nommage Variables et Fonctions

```typescript
// ❌ INTERDIT - Noms génériques
const data = await fetch('/api/bookings');
const result = processStuff();
const temp = user;
const x = 10;
function handle() {}
function do() {}

// ✅ CORRECT - Noms descriptifs
const bookingsData = await fetch('/api/bookings');
const validationResult = validateBookingForm(formData);
const currentUser = user;
const maxBookingsPerDay = 10;
function handleSubmit() {}
function calculateTotalPrice() {}
```

**Conventions** :
- ✅ Variables : `camelCase`, descriptives
- ✅ Constantes : `UPPER_SNAKE_CASE` ou `camelCase`
- ✅ Fonctions : `camelCase`, verbe + nom
- ✅ Composants : `PascalCase`
- ✅ Types/Interfaces : `PascalCase`
- ❌ Pas d'abrév cryptiques
- ❌ Pas de noms 1-2 lettres (sauf boucles `i`, `j`)

---

---

## 🎯 7. SEO BEST PRACTICES

### Vue d'ensemble SEO

**Objectif** : Maximiser la visibilité du site sur les moteurs de recherche

**Cibles principales** :
- Google (95% du trafic)
- Recherches locales ("coworking Paris", "espace de travail")
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Metadata Next.js 14 avec generateMetadata()

**RÈGLE** : Utiliser `generateMetadata()` pour TOUTES les pages (dynamiques et statiques)

#### Pages Statiques

```typescript
// app/(site)/page.tsx - Homepage
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CoworKing Café - Espace de Coworking à Paris',
  description: 'Découvrez notre espace de coworking convivial au cœur de Paris. Tarif anticafé : payez le temps, consommez à volonté. Wifi haut débit, salles de réunion.',
  keywords: ['coworking', 'paris', 'espace de travail', 'anticafé', 'wifi', 'bureau partagé'],
  authors: [{ name: 'CoworKing Café' }],
  openGraph: {
    title: 'CoworKing Café - Espace de Coworking à Paris',
    description: 'Espace de coworking convivial avec tarif anticafé',
    url: 'https://coworkingcafe.fr',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Paris'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoworKing Café - Espace de Coworking à Paris',
    description: 'Espace de coworking convivial avec tarif anticafé',
    images: ['/images/og-home.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr'
  }
};

export default function HomePage() {
  return <div>...</div>;
}
```

#### Pages Dynamiques

```typescript
// app/(site)/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { Article } from '@coworking-cafe/database';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Fetch article
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    return {
      title: 'Article non trouvé',
      robots: { index: false, follow: false }
    };
  }

  return {
    title: `${article.title} | Blog CoworKing Café`,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: 'CoworKing Café' }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://coworkingcafe.fr/blog/${article.slug}`,
      siteName: 'CoworKing Café',
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ],
      locale: 'fr_FR',
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: ['CoworKing Café'],
      tags: article.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage]
    },
    alternates: {
      canonical: `https://coworkingcafe.fr/blog/${article.slug}`
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    notFound();
  }

  return <div>...</div>;
}
```

### Schema.org JSON-LD

**RÈGLE** : Ajouter des données structurées JSON-LD sur toutes les pages pertinentes

#### LocalBusiness (Homepage)

```typescript
// components/seo/LocalBusinessSchema.tsx
export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://coworkingcafe.fr/#organization',
    name: 'CoworKing Café',
    image: 'https://coworkingcafe.fr/images/logo.png',
    description: 'Espace de coworking convivial avec concept anticafé à Paris',
    url: 'https://coworkingcafe.fr',
    telephone: '+33123456789',
    email: 'contact@coworkingcafe.fr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Rue de Rivoli',
      addressLocality: 'Paris',
      postalCode: '75001',
      addressCountry: 'FR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8566,
      longitude: 2.3522
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    priceRange: '€€',
    acceptsReservations: true,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Wifi haut débit' },
      { '@type': 'LocationFeatureSpecification', name: 'Salles de réunion' },
      { '@type': 'LocationFeatureSpecification', name: 'Café/Thé à volonté' }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage dans app/(site)/layout.tsx
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <LocalBusinessSchema />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### Article (Blog)

```typescript
// components/seo/ArticleSchema.tsx
interface ArticleSchemaProps {
  title: string;
  description: string;
  coverImage: string;
  publishedAt: Date;
  updatedAt: Date;
  author: string;
  slug: string;
}

export function ArticleSchema({
  title,
  description,
  coverImage,
  publishedAt,
  updatedAt,
  author,
  slug
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: coverImage,
    datePublished: publishedAt.toISOString(),
    dateModified: updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'CoworKing Café',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coworkingcafe.fr/images/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coworkingcafe.fr/blog/${slug}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Breadcrumb

```typescript
// components/seo/BreadcrumbSchema.tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage
<BreadcrumbSchema
  items={[
    { name: 'Accueil', url: 'https://coworkingcafe.fr' },
    { name: 'Blog', url: 'https://coworkingcafe.fr/blog' },
    { name: article.title, url: `https://coworkingcafe.fr/blog/${article.slug}` }
  ]}
/>
```

#### FAQ Schema

```typescript
// components/seo/FAQSchema.tsx
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage page tarifs
<FAQSchema
  items={[
    {
      question: 'Comment fonctionne la tarification anticafé ?',
      answer: 'Vous payez uniquement le temps passé dans notre espace. Les consommations (café, thé, snacks) sont illimitées et incluses.'
    },
    {
      question: 'Puis-je réserver une salle de réunion ?',
      answer: 'Oui, nos salles de réunion sont disponibles à la réservation en ligne. Capacité de 4 à 12 personnes selon la salle.'
    }
  ]}
/>
```

### next/image pour Toutes les Images

**RÈGLE** : Utiliser `next/image` pour TOUTES les images (jamais `<img>`)

```typescript
// ❌ INTERDIT
<img src="/images/hero.jpg" alt="Hero" />

// ✅ CORRECT
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Espace de coworking CoworKing Café Paris"
  width={1200}
  height={600}
  priority              // Pour LCP (Largest Contentful Paint)
  quality={90}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Images de contenu
<Image
  src="/images/space-1.jpg"
  alt="Salle de réunion moderne avec écran"
  width={800}
  height={500}
  loading="lazy"
  quality={85}
/>
```

**Configuration next.config.js** :

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['coworkingcafe.fr', 'cdn.coworkingcafe.fr'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  }
};
```

### Sitemap Dynamique

**Fichier** : `app/sitemap.ts`

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { Article } from '@coworking-cafe/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://coworkingcafe.fr';

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/concept`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/spaces`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/student-offers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/members-program`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5
    }
  ];

  // Articles blog (dynamiques)
  const articles = await Article.find({ status: 'published' })
    .select('slug updatedAt')
    .sort({ publishedAt: -1 })
    .lean();

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6
  }));

  return [...staticPages, ...articlePages];
}
```

### robots.txt

**Fichier** : `app/robots.ts`

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/admin/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/admin/'],
        crawlDelay: 0
      }
    ],
    sitemap: 'https://coworkingcafe.fr/sitemap.xml'
  };
}
```

### Core Web Vitals

**Objectifs** :
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1

#### Optimisations LCP

```typescript
// 1. Précharger images critiques (Hero)
// app/(site)/layout.tsx
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero.jpg"
          imageSrcSet="/images/hero-640.jpg 640w, /images/hero-1200.jpg 1200w"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// 2. Image hero avec priority
<Image
  src="/images/hero.jpg"
  alt="CoworKing Café"
  width={1200}
  height={600}
  priority          // ← Force eager loading
  quality={90}
/>

// 3. Fonts optimisées
// app/(site)/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',          // ← Évite FOIT (Flash of Invisible Text)
  preload: true
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

#### Optimisations CLS

```scss
// Éviter layout shift sur images
.hero__image {
  aspect-ratio: 16/9;           // ← Réserve l'espace
  width: 100%;
  height: auto;
}

// Skeleton loaders
.card--loading {
  .card__image {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    aspect-ratio: 16/9;
  }

  .card__title {
    height: 24px;
    background: #f0f0f0;
    border-radius: 4px;
  }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Template SEO Complet - Homepage

```typescript
// app/(site)/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';
import { FAQSchema } from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'CoworKing Café Paris - Espace de Coworking Anticafé | Wifi Haut Débit',
  description: 'Espace de coworking convivial à Paris avec tarif anticafé. Wifi haut débit, salles de réunion, café/thé illimité. Réservez en ligne dès maintenant.',
  keywords: [
    'coworking paris',
    'espace de travail paris',
    'anticafé',
    'bureau partagé',
    'salle de réunion paris',
    'wifi gratuit paris',
    'coworking convivial'
  ],
  openGraph: {
    title: 'CoworKing Café Paris - Espace de Coworking Anticafé',
    description: 'Espace de coworking convivial avec tarif anticafé. Payez le temps, consommez à volonté.',
    url: 'https://coworkingcafe.fr',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Paris - Espace moderne et convivial'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoworKing Café Paris - Espace de Coworking Anticafé',
    description: 'Espace de coworking convivial avec tarif anticafé',
    images: ['/images/og-home.jpg']
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr'
  }
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema
        items={[
          {
            question: 'Qu\'est-ce que le concept anticafé ?',
            answer: 'Le concept anticafé vous permet de payer uniquement le temps passé dans notre espace. Toutes les consommations (café, thé, snacks) sont incluses et illimitées.'
          },
          {
            question: 'Faut-il réserver en avance ?',
            answer: 'La réservation n\'est pas obligatoire pour l\'open-space, mais recommandée pour les salles de réunion privées.'
          }
        ]}
      />

      <main>
        <section className="page-home__hero">
          <Image
            src="/images/hero.jpg"
            alt="Espace de coworking moderne CoworKing Café Paris avec bureau partagé et wifi haut débit"
            width={1200}
            height={600}
            priority
            quality={90}
          />
          <h1>Votre Espace de Coworking à Paris</h1>
          <p>Concept anticafé - Wifi haut débit - Ambiance conviviale</p>
        </section>

        {/* Reste du contenu */}
      </main>
    </>
  );
}
```

### Template SEO Complet - Article Blog

```typescript
// app/(site)/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Article } from '@coworking-cafe/database';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    return { title: 'Article non trouvé', robots: { index: false } };
  }

  return {
    title: `${article.title} | Blog CoworKing Café`,
    description: article.excerpt,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://coworkingcafe.fr/blog/${article.slug}`,
      siteName: 'CoworKing Café',
      images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }],
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: ['CoworKing Café'],
      tags: article.tags
    },
    alternates: { canonical: `https://coworkingcafe.fr/blog/${article.slug}` }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleSchema
        title={article.title}
        description={article.excerpt}
        coverImage={article.coverImage}
        publishedAt={article.publishedAt!}
        updatedAt={article.updatedAt}
        author="CoworKing Café"
        slug={article.slug}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://coworkingcafe.fr' },
          { name: 'Blog', url: 'https://coworkingcafe.fr/blog' },
          { name: article.title, url: `https://coworkingcafe.fr/blog/${article.slug}` }
        ]}
      />

      <article className="page-article">
        <header className="page-article__header">
          <h1>{article.title}</h1>
          <p className="page-article__excerpt">{article.excerpt}</p>
          <Image
            src={article.coverImage}
            alt={article.title}
            width={1200}
            height={600}
            priority
            quality={90}
          />
        </header>

        <div className="page-article__content">
          {/* Contenu article */}
        </div>
      </article>
    </>
  );
}
```

### Template SEO - Page Espace

```typescript
// app/(site)/spaces/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { Space } from '@coworking-cafe/database';

export const metadata: Metadata = {
  title: 'Nos Espaces de Coworking à Paris | CoworKing Café',
  description: 'Découvrez nos espaces : open-space moderne, salles de réunion équipées, bureaux privés. Wifi haut débit, équipements professionnels inclus.',
  keywords: ['open-space paris', 'salle de réunion paris', 'bureau privé paris', 'coworking équipé'],
  openGraph: {
    title: 'Nos Espaces de Coworking à Paris',
    description: 'Open-space, salles de réunion, bureaux privés - Équipements professionnels',
    url: 'https://coworkingcafe.fr/spaces',
    siteName: 'CoworKing Café',
    images: [{ url: '/images/og-spaces.jpg', width: 1200, height: 630 }],
    type: 'website'
  },
  alternates: { canonical: 'https://coworkingcafe.fr/spaces' }
};

export default async function SpacesPage() {
  const spaces = await Space.find({ isActive: true }).lean();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: spaces.map((space, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: space.name,
        description: space.description,
        image: space.images[0],
        offers: {
          '@type': 'Offer',
          price: space.pricePerHour,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock'
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="page-spaces">
        <h1>Nos Espaces de Coworking</h1>
        <div className="page-spaces__grid">
          {spaces.map((space) => (
            <article key={space._id.toString()} className="space-card">
              <Image
                src={space.images[0]}
                alt={`${space.name} - ${space.description}`}
                width={600}
                height={400}
                loading="lazy"
                quality={85}
              />
              <h2>{space.name}</h2>
              <p>{space.description}</p>
              <p>{space.pricePerHour}€/heure</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
```

---
## 📅 8. WORKFLOW BOOKING COMPLET

### Vue d'ensemble du Booking Flow

**6 étapes complètes** : Sélection → Calcul Prix → Paiement → Confirmation → Webhook → Email

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ PAGE SÉLECTION                                          │
│     └─> Formulaire (espace, date, heure, nb personnes)     │
│         └─> POST /api/booking/calculate                     │
│                                                              │
│  2️⃣ API CALCUL PRIX (Server-Side)                           │
│     └─> Validation données                                  │
│     └─> Vérification disponibilité                         │
│     └─> Calcul prix (base + options + promo)               │
│     └─> Retour: { price, breakdown, available }            │
│                                                              │
│  3️⃣ PAGE CONFIRMATION                                       │
│     └─> Affichage récapitulatif                            │
│     └─> Bouton "Payer"                                      │
│         └─> POST /api/booking/create-payment-intent         │
│                                                              │
│  4️⃣ CRÉATION PAYMENT INTENT (Stripe)                        │
│     └─> Créer Payment Intent Stripe                         │
│     └─> Créer Booking (status: 'pending')                  │
│     └─> Retour: { clientSecret, bookingId }                │
│                                                              │
│  5️⃣ PAGE CHECKOUT (Client)                                  │
│     └─> Stripe Elements (CardElement)                       │
│     └─> confirmPayment() côté client                        │
│     └─> Redirection → /booking/success?id=xxx              │
│                                                              │
│  6️⃣ WEBHOOK STRIPE                                          │
│     └─> Événement: payment_intent.succeeded                │
│     └─> Update Booking (status: 'confirmed')               │
│     └─> Envoi email confirmation                           │
│                                                              │
│  7️⃣ PAGE SUCCESS                                            │
│     └─> Affichage confirmation                             │
│     └─> Lien vers Dashboard                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Étape 1: Page Sélection (Formulaire)

**Fichier** : `app/(site)/booking/page.tsx`

```typescript
// app/(site)/booking/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingForm } from '@/hooks/useBookingForm';
import { SpaceSelector } from '@/components/booking/SpaceSelector';
import { DateTimePicker } from '@/components/booking/DateTimePicker';
import { Button } from '@/components/ui/Button';

export default function BookingPage() {
  const router = useRouter();
  const { formData, errors, loading, handleChange, handleSubmit } = useBookingForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await handleSubmit();

    if (result.success) {
      // Rediriger vers page confirmation avec données
      const params = new URLSearchParams({
        spaceId: formData.spaceId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.numberOfPeople.toString(),
        promoCode: formData.promoCode || ''
      });

      router.push(`/booking/confirmation?${params.toString()}`);
    }
  };

  return (
    <main className="page-booking">
      <h1>Réserver un Espace</h1>

      <form onSubmit={onSubmit} className="page-booking__form">
        <SpaceSelector
          value={formData.spaceId}
          onChange={(value) => handleChange('spaceId', value)}
          error={errors.spaceId}
        />

        <DateTimePicker
          date={formData.date}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDateChange={(value) => handleChange('date', value)}
          onStartTimeChange={(value) => handleChange('startTime', value)}
          onEndTimeChange={(value) => handleChange('endTime', value)}
          errors={{
            date: errors.date,
            startTime: errors.startTime,
            endTime: errors.endTime
          }}
        />

        <div className="page-booking__form-field">
          <label htmlFor="numberOfPeople">Nombre de personnes</label>
          <input
            type="number"
            id="numberOfPeople"
            min="1"
            max="20"
            value={formData.numberOfPeople}
            onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
            className={errors.numberOfPeople ? 'input--error' : ''}
          />
          {errors.numberOfPeople && (
            <span className="error">{errors.numberOfPeople}</span>
          )}
        </div>

        <div className="page-booking__form-field">
          <label htmlFor="promoCode">Code promo (optionnel)</label>
          <input
            type="text"
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => handleChange('promoCode', e.target.value)}
            placeholder="STUDENT2026"
          />
        </div>

        <Button type="submit" loading={loading} className="btn--primary btn--lg">
          Continuer
        </Button>
      </form>
    </main>
  );
}
```

**Hook** : `hooks/useBookingForm.ts`

```typescript
// hooks/useBookingForm.ts
import { useState } from 'react';
import type { BookingFormData, ValidationErrors } from '@/types/booking';

export function useBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    spaceId: '',
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 1,
    promoCode: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.spaceId) {
      newErrors.spaceId = 'Veuillez sélectionner un espace';
    }

    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Veuillez sélectionner une heure de début';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Veuillez sélectionner une heure de fin';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
    }

    if (formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Au moins 1 personne requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return { success: false };
    }

    setLoading(true);

    try {
      // Vérifier disponibilité et calculer prix
      const response = await fetch('/api/booking/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        setErrors({ general: result.error });
        return { success: false };
      }

      return { success: true, data: result.data };
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue' });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  };
}
```

### Étape 2: API Calcul Prix (Server-Side)

**Fichier** : `app/api/booking/calculate/route.ts`

```typescript
// app/api/booking/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Booking, Space, PromoConfig } from '@coworking-cafe/database';
import { calculateHours } from '@/lib/utils/format-date';

interface CalculateRequest {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  promoCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();
    const { spaceId, date, startTime, endTime, numberOfPeople, promoCode } = body;

    // 1. Validation
    if (!spaceId || !date || !startTime || !endTime || !numberOfPeople) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // 2. Vérifier que l'espace existe
    const space = await Space.findById(spaceId);

    if (!space || !space.isActive) {
      return NextResponse.json(
        { success: false, error: 'Espace non disponible' },
        { status: 404 }
      );
    }

    // 3. Vérifier capacité
    if (numberOfPeople > space.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Capacité maximale dépassée (${space.capacity} personnes max)`
        },
        { status: 400 }
      );
    }

    // 4. Vérifier disponibilité (pas de réservation existante)
    const existingBooking = await Booking.findOne({
      spaceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // Cas 1: Nouvelle résa commence pendant une résa existante
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        // Cas 2: Nouvelle résa finit pendant une résa existante
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        // Cas 3: Nouvelle résa englobe une résa existante
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cet espace est déjà réservé sur ce créneau'
        },
        { status: 409 }
      );
    }

    // 5. Calculer prix
    const hours = calculateHours(startTime, endTime);
    const basePrice = space.pricePerHour * hours;

    let discount = 0;
    let promoDetails = null;

    // 6. Appliquer code promo si fourni
    if (promoCode) {
      const promo = await PromoConfig.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (promo) {
        if (promo.discountType === 'percentage') {
          discount = (basePrice * promo.discountValue) / 100;
        } else if (promo.discountType === 'fixed') {
          discount = promo.discountValue;
        }

        promoDetails = {
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue
        };
      }
    }

    const totalPrice = Math.max(0, basePrice - discount);

    // 7. Retourner détails
    return NextResponse.json({
      success: true,
      data: {
        available: true,
        space: {
          id: space._id,
          name: space.name,
          pricePerHour: space.pricePerHour
        },
        booking: {
          date,
          startTime,
          endTime,
          numberOfPeople,
          hours
        },
        pricing: {
          basePrice,
          discount,
          totalPrice,
          promo: promoDetails
        }
      }
    });
  } catch (error) {
    console.error('Error calculating booking price:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### Étape 3: Page Confirmation

**Fichier** : `app/(site)/booking/confirmation/page.tsx`

```typescript
// app/(site)/booking/confirmation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface PricingData {
  available: boolean;
  space: {
    id: string;
    name: string;
    pricePerHour: number;
  };
  booking: {
    date: string;
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    hours: number;
  };
  pricing: {
    basePrice: number;
    discount: number;
    totalPrice: number;
    promo: {
      code: string;
      description: string;
    } | null;
  };
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Récupérer les données depuis les query params
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/booking/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spaceId: searchParams.get('spaceId'),
            date: searchParams.get('date'),
            startTime: searchParams.get('startTime'),
            endTime: searchParams.get('endTime'),
            numberOfPeople: parseInt(searchParams.get('numberOfPeople') || '1'),
            promoCode: searchParams.get('promoCode') || undefined
          })
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error);
          return;
        }

        setData(result.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [searchParams]);

  const handleProceedToPayment = async () => {
    if (!data) return;

    setProcessing(true);

    try {
      // Créer Payment Intent
      const response = await fetch('/api/booking/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: data.space.id,
          date: data.booking.date,
          startTime: data.booking.startTime,
          endTime: data.booking.endTime,
          numberOfPeople: data.booking.numberOfPeople,
          totalPrice: data.pricing.totalPrice,
          promoCode: data.pricing.promo?.code
        })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Rediriger vers page checkout avec clientSecret
      router.push(
        `/booking/checkout?clientSecret=${result.data.clientSecret}&bookingId=${result.data.bookingId}`
      );
    } catch (err) {
      setError('Erreur lors de la création du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-booking-confirmation">
        <Spinner />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-booking-confirmation">
        <h1>Erreur</h1>
        <p>{error || 'Données invalides'}</p>
        <Button onClick={() => router.push('/booking')}>Retour</Button>
      </main>
    );
  }

  return (
    <main className="page-booking-confirmation">
      <h1>Confirmation de Réservation</h1>

      <BookingSummary
        spaceName={data.space.name}
        date={data.booking.date}
        startTime={data.booking.startTime}
        endTime={data.booking.endTime}
        numberOfPeople={data.booking.numberOfPeople}
        hours={data.booking.hours}
        basePrice={data.pricing.basePrice}
        discount={data.pricing.discount}
        totalPrice={data.pricing.totalPrice}
        promo={data.pricing.promo}
      />

      <div className="page-booking-confirmation__actions">
        <Button variant="outline" onClick={() => router.back()}>
          Modifier
        </Button>
        <Button
          variant="primary"
          onClick={handleProceedToPayment}
          loading={processing}
        >
          Procéder au paiement
        </Button>
      </div>
    </main>
  );
}
```

### Étape 4: Création Payment Intent

**Fichier** : `app/api/booking/create-payment-intent/route.ts`

```typescript
// app/api/booking/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@coworking-cafe/database/lib/stripe';
import { Booking } from '@coworking-cafe/database';

interface CreatePaymentIntentRequest {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  promoCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier authentification
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body: CreatePaymentIntentRequest = await request.json();
    const { spaceId, date, startTime, endTime, numberOfPeople, totalPrice, promoCode } = body;

    // 2. Créer Payment Intent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        userId: session.user.id,
        spaceId,
        date,
        startTime,
        endTime,
        numberOfPeople: numberOfPeople.toString(),
        promoCode: promoCode || ''
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // 3. Créer Booking en DB (status: 'pending')
    const booking = await Booking.create({
      userId: session.user.id,
      spaceId,
      date,
      startTime,
      endTime,
      numberOfPeople,
      totalPrice,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      promoCode
    });

    // 4. Retourner clientSecret et bookingId
    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        bookingId: booking._id.toString()
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
```

### Étape 5: Page Checkout (Stripe)

**Fichier** : `app/(site)/booking/checkout/page.tsx`

```typescript
// app/(site)/booking/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success?id=${bookingId}`
        }
      });

      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout__form">
      <PaymentElement />

      {error && <div className="error">{error}</div>}

      <Button
        type="submit"
        variant="primary"
        loading={processing}
        disabled={!stripe || processing}
        className="btn--lg"
      >
        Payer maintenant
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');
  const bookingId = searchParams.get('bookingId');

  if (!clientSecret || !bookingId) {
    return (
      <main className="page-checkout">
        <h1>Erreur</h1>
        <p>Données de paiement invalides</p>
      </main>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const
    }
  };

  return (
    <main className="page-checkout">
      <h1>Paiement Sécurisé</h1>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm bookingId={bookingId} />
      </Elements>
    </main>
  );
}
```

### Étape 6: Webhook Stripe

**Fichier** : `app/api/stripe/webhook/route.ts`

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@coworking-cafe/database/lib/stripe';
import { Booking } from '@coworking-cafe/database';
import { sendBookingConfirmationEmail } from '@/lib/email/bookingConfirmation';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Traiter l'événement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      // 1. Trouver la réservation
      const booking = await Booking.findOne({
        paymentIntentId: paymentIntent.id
      }).populate('userId spaceId');

      if (!booking) {
        console.error('Booking not found for payment intent:', paymentIntent.id);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // 2. Mettre à jour le statut
      booking.status = 'confirmed';
      await booking.save();

      // 3. Envoyer email de confirmation
      await sendBookingConfirmationEmail({
        to: booking.userId.email,
        bookingId: booking._id.toString(),
        spaceName: booking.spaceId.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice
      });

      console.log('Booking confirmed:', booking._id);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Processing error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
```

### Étape 7: Page Success

**Fichier** : `app/(site)/booking/success/page.tsx`

```typescript
// app/(site)/booking/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface BookingData {
  _id: string;
  spaceId: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('ID de réservation manquant');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error);
          return;
        }

        setBooking(result.data);
      } catch (err) {
        setError('Erreur lors du chargement de la réservation');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <main className="page-booking-success">
        <Spinner />
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="page-booking-success">
        <h1>Erreur</h1>
        <p>{error || 'Réservation introuvable'}</p>
        <Button onClick={() => router.push('/booking')}>Retour</Button>
      </main>
    );
  }

  return (
    <main className="page-booking-success">
      <div className="page-booking-success__icon">✅</div>

      <h1>Réservation Confirmée !</h1>

      <p className="page-booking-success__message">
        Votre réservation a été confirmée avec succès. Un email de confirmation vous a été envoyé.
      </p>

      <div className="page-booking-success__details">
        <h2>Détails de votre réservation</h2>
        <dl>
          <dt>Espace</dt>
          <dd>{booking.spaceId.name}</dd>

          <dt>Date</dt>
          <dd>{new Date(booking.date).toLocaleDateString('fr-FR')}</dd>

          <dt>Horaire</dt>
          <dd>{booking.startTime} - {booking.endTime}</dd>

          <dt>Nombre de personnes</dt>
          <dd>{booking.numberOfPeople}</dd>

          <dt>Total payé</dt>
          <dd>{booking.totalPrice.toFixed(2)}€</dd>

          <dt>Référence</dt>
          <dd>{booking._id}</dd>
        </dl>
      </div>

      <div className="page-booking-success__actions">
        <Link href="/dashboard/bookings">
          <Button variant="primary">Voir mes réservations</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Retour à l'accueil</Button>
        </Link>
      </div>
    </main>
  );
}
```

### Helper Email Confirmation

**Fichier** : `lib/email/bookingConfirmation.ts`

```typescript
// lib/email/bookingConfirmation.ts
import { sendEmail } from '@coworking-cafe/email';

interface BookingConfirmationData {
  to: string;
  bookingId: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  const { to, bookingId, spaceName, date, startTime, endTime, totalPrice } = data;

  const subject = 'Confirmation de réservation - CoworKing Café';

  const html = `
    <h1>Réservation Confirmée</h1>
    
    <p>Bonjour,</p>
    
    <p>Votre réservation a été confirmée avec succès !</p>
    
    <h2>Détails de votre réservation</h2>
    <ul>
      <li><strong>Espace :</strong> ${spaceName}</li>
      <li><strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR')}</li>
      <li><strong>Horaire :</strong> ${startTime} - ${endTime}</li>
      <li><strong>Total payé :</strong> ${totalPrice.toFixed(2)}€</li>
      <li><strong>Référence :</strong> ${bookingId}</li>
    </ul>
    
    <p>Nous vous attendons avec impatience !</p>
    
    <p>
      <a href="https://coworkingcafe.fr/dashboard/bookings/${bookingId}">
        Voir ma réservation
      </a>
    </p>
    
    <p>L'équipe CoworKing Café</p>
  `;

  await sendEmail({
    to,
    subject,
    html
  });
}
```

---

## 💳 9. INTÉGRATION STRIPE

### Import depuis Package Partagé

**RÈGLE** : Toujours utiliser l'instance Stripe du package `@coworking-cafe/database`

```typescript
// ✅ CORRECT - Import depuis package
import { stripe } from '@coworking-cafe/database/lib/stripe';

// ❌ INTERDIT - Créer sa propre instance
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### Configuration des Clés

**Fichier** : `.env.local`

```bash
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production
# STRIPE_SECRET_KEY=sk_live_51...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
```

### Fonctions Utilitaires Stripe

#### createPaymentIntent()

```typescript
// lib/stripe/server.ts
import { stripe } from '@coworking-cafe/database/lib/stripe';

interface CreatePaymentIntentParams {
  amount: number;  // En centimes
  currency?: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const { amount, currency = 'eur', metadata = {} } = params;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      success: true,
      data: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      }
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: 'Erreur lors de la création du paiement'
    };
  }
}
```

#### cancelIntent()

```typescript
// lib/stripe/server.ts
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    };
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'annulation du paiement'
    };
  }
}
```

#### captureIntent()

```typescript
// lib/stripe/server.ts
export async function capturePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return {
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      }
    };
  } catch (error) {
    console.error('Error capturing payment intent:', error);
    return {
      success: false,
      error: 'Erreur lors de la capture du paiement'
    };
  }
}
```

#### createRefund()

```typescript
// lib/stripe/server.ts
interface CreateRefundParams {
  paymentIntentId: string;
  amount?: number;  // Optionnel: remboursement partiel
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export async function createRefund(params: CreateRefundParams) {
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = params;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason
    });

    return {
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: 'Erreur lors du remboursement'
    };
  }
}
```

### Webhook Handler avec Vérification

**Fichier complet** : `app/api/stripe/webhook/route.ts`

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@coworking-cafe/database/lib/stripe';
import { Booking, Payment } from '@coworking-cafe/database';
import { sendBookingConfirmationEmail } from '@/lib/email/bookingConfirmation';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // 1. Vérifier la signature webhook
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // 2. Traiter les différents types d'événements
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Processing error' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // 1. Trouver la réservation
  const booking = await Booking.findOne({
    paymentIntentId: paymentIntent.id
  }).populate('userId spaceId');

  if (!booking) {
    console.error('Booking not found for payment intent:', paymentIntent.id);
    return;
  }

  // 2. Mettre à jour le statut
  booking.status = 'confirmed';
  await booking.save();

  // 3. Créer Payment record
  await Payment.create({
    bookingId: booking._id,
    userId: booking.userId._id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    stripePaymentIntentId: paymentIntent.id,
    status: 'succeeded',
    paymentMethod: 'card'
  });

  // 4. Envoyer email confirmation
  await sendBookingConfirmationEmail({
    to: booking.userId.email,
    bookingId: booking._id.toString(),
    spaceName: booking.spaceId.name,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalPrice: booking.totalPrice
  });

  console.log(`Booking confirmed: ${booking._id}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const booking = await Booking.findOne({
    paymentIntentId: paymentIntent.id
  });

  if (booking) {
    booking.status = 'cancelled';
    await booking.save();

    console.log(`Booking cancelled due to payment failure: ${booking._id}`);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: charge.payment_intent
  });

  if (payment) {
    payment.status = 'refunded';
    await payment.save();

    // Annuler la réservation
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = 'cancelled';
      await booking.save();
    }

    console.log(`Payment refunded: ${payment._id}`);
  }
}
```

### Exemple Complet: Annuler une Réservation avec Remboursement

```typescript
// app/api/booking/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Booking } from '@coworking-cafe/database';
import { createRefund } from '@/lib/stripe/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 1. Trouver la réservation
    const booking = await Booking.findOne({
      _id: params.id,
      userId: session.user.id
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Réservation non éligible à l\'annulation' },
        { status: 400 }
      );
    }

    // 2. Créer le remboursement Stripe
    if (booking.paymentIntentId) {
      const refundResult = await createRefund({
        paymentIntentId: booking.paymentIntentId,
        reason: 'requested_by_customer'
      });

      if (!refundResult.success) {
        return NextResponse.json(
          { success: false, error: refundResult.error },
          { status: 500 }
        );
      }
    }

    // 3. Mettre à jour la réservation
    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée et remboursement initié'
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

## 📝 10. BLOG SYSTEM

### Models

**Fichier** : `packages/database/src/models/Article.ts` (déjà existant)

```typescript
// Article, Category, Comment sont dans packages/database
import { Article, Category, Comment } from '@coworking-cafe/database';
```

### Pages Blog

#### Liste Articles

**Fichier** : `app/(site)/blog/page.tsx`

```typescript
// app/(site)/blog/page.tsx
import type { Metadata } from 'next';
import { Article, Category } from '@coworking-cafe/database';
import { ArticleCard } from '@/components/blog/ArticleCard';

export const metadata: Metadata = {
  title: 'Blog | CoworKing Café',
  description: 'Actualités, conseils et astuces pour le coworking à Paris',
  alternates: { canonical: 'https://coworkingcafe.fr/blog' }
};

export default async function BlogPage() {
  const articles = await Article.find({ status: 'published' })
    .populate('categoryId', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean();

  const categories = await Category.find().lean();

  return (
    <main className="page-blog">
      <h1>Blog</h1>

      <div className="page-blog__categories">
        {categories.map((category) => (
          <a
            key={category._id.toString()}
            href={`/blog/category/${category.slug}`}
            className="page-blog__category-link"
          >
            {category.name}
          </a>
        ))}
      </div>

      <div className="page-blog__grid">
        {articles.map((article) => (
          <ArticleCard
            key={article._id.toString()}
            slug={article.slug}
            title={article.title}
            excerpt={article.excerpt}
            coverImage={article.coverImage}
            publishedAt={article.publishedAt!}
            category={article.categoryId.name}
          />
        ))}
      </div>
    </main>
  );
}
```

#### Détail Article

**Fichier** : `app/(site)/blog/[slug]/page.tsx`

```typescript
// app/(site)/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Article } from '@coworking-cafe/database';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { CommentSection } from '@/components/blog/CommentSection';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    return { title: 'Article non trouvé', robots: { index: false } };
  }

  return {
    title: `${article.title} | Blog CoworKing Café`,
    description: article.excerpt,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://coworkingcafe.fr/blog/${article.slug}`,
      type: 'article',
      images: [{ url: article.coverImage, width: 1200, height: 630 }]
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await Article.findOne({ slug: params.slug, status: 'published' })
    .populate('categoryId', 'name slug')
    .lean();

  if (!article) {
    notFound();
  }

  // Incrémenter vues
  await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

  return (
    <>
      <ArticleSchema
        title={article.title}
        description={article.excerpt}
        coverImage={article.coverImage}
        publishedAt={article.publishedAt!}
        updatedAt={article.updatedAt}
        author="CoworKing Café"
        slug={article.slug}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://coworkingcafe.fr' },
          { name: 'Blog', url: 'https://coworkingcafe.fr/blog' },
          { name: article.title, url: `https://coworkingcafe.fr/blog/${article.slug}` }
        ]}
      />

      <article className="page-article">
        <header className="page-article__header">
          <div className="page-article__meta">
            <span className="page-article__category">{article.categoryId.name}</span>
            <time dateTime={article.publishedAt!.toISOString()}>
              {new Date(article.publishedAt!).toLocaleDateString('fr-FR')}
            </time>
          </div>

          <h1>{article.title}</h1>
          <p className="page-article__excerpt">{article.excerpt}</p>

          <Image
            src={article.coverImage}
            alt={article.title}
            width={1200}
            height={600}
            priority
            quality={90}
          />
        </header>

        <div
          className="page-article__content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="page-article__footer">
          <div className="page-article__tags">
            {article.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          <div className="page-article__stats">
            {article.views} vues
          </div>
        </footer>

        <CommentSection articleId={article._id.toString()} />
      </article>
    </>
  );
}
```

### APIs Blog

#### GET /api/blog/articles

```typescript
// app/api/blog/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Article } from '@coworking-cafe/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = { status: 'published' };

    if (category) {
      query.categoryId = category;
    }

    const articles = await Article.find(query)
      .populate('categoryId', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

## 👤 11. DASHBOARD CLIENT

### Routes Dashboard

**Structure** :

```
app/dashboard/
├── layout.tsx             # Layout dashboard (nav, sidebar)
├── page.tsx               # Overview
├── bookings/
│   ├── page.tsx           # Liste réservations
│   └── [id]/page.tsx      # Détail réservation
├── profile/page.tsx       # Profil utilisateur
├── messages/page.tsx      # Messagerie
└── settings/page.tsx      # Paramètres
```

### Middleware Auth

**Fichier** : `app/dashboard/layout.tsx`

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  if (session.user.role !== 'client') {
    redirect('/');
  }

  return (
    <div className="dashboard">
      <DashboardNav user={session.user} />
      <main className="dashboard__content">{children}</main>
    </div>
  );
}
```

### vs Dashboard Admin

| Fonctionnalité | Dashboard Client | Dashboard Admin |
|----------------|------------------|-----------------|
| **URL** | `/dashboard/*` | Séparé (`apps/admin`) |
| **Rôle** | `client` | `dev`, `admin`, `staff` |
| **Réservations** | Mes réservations uniquement | Toutes les réservations |
| **Profil** | Mon profil | Gestion utilisateurs |
| **Messages** | Ma messagerie | Toutes conversations |
| **Stack** | Bootstrap + SCSS | Tailwind + shadcn/ui |

---

## 🧪 12. PHASE DE TESTS ET REFACTORISATION

### 📊 Situation Actuelle

**Code Base** : `src/` = Code fonctionnel (anciennement `src-old/`)
- ✅ **Fonctionnel** : Site opérationnel, toutes features OK
- ✅ **Cohérent** : Textes, mises en page, styles préservés
- ❌ **Qualité** : Types `any`, fichiers longs, duplication

**Approche Choisie** : Tests → Refactorisation Progressive (7 jours)
- **PAS de réécriture** complète (trop risqué)
- **Amélioration progressive** du code existant
- **Stabilité prioritaire** : Ne rien casser

---

## 📅 Workflow : 2 Phases

### Phase A : Tests et Validation (En cours)

**Objectif** : S'assurer que tout fonctionne avant refactorisation

#### 1. Tests Pages Site Public (2-3h)
- [ ] **Homepage** - Hero, sections, navigation
- [ ] **Concept** - Affichage correct des textes et images
- [ ] **Spaces** - Cards des espaces, descriptions
- [ ] **Pricing** - Tables de prix affichées
- [ ] **Student Offers** - Tarifs étudiants
- [ ] **Members Program** - Programme fidélité
- [ ] **Blog** - Liste articles, détail article
- [ ] **Contact** - Formulaire de contact
- [ ] **Legal** - Mentions légales, CGU, confidentialité

#### 2. Tests APIs et Logique Métier (2-3h)
- [ ] **GET /api/spaces** - Récupération espaces
- [ ] **GET /api/blog/articles** - Liste articles
- [ ] **POST /api/contact** - Envoi formulaire contact
- [ ] **GET /api/booking/availability** - Vérif disponibilités
- [ ] **POST /api/auth/register** - Création compte
- [ ] **POST /api/auth/login** - Connexion
- [ ] **POST /api/auth/forgot-password** - Reset password

#### 3. Tests Dashboard Client (1-2h)
- [ ] **/[id]** - Dashboard overview
- [ ] **/[id]/reservations** - Mes réservations
- [ ] **/[id]/profile** - Mon profil (lecture/édition)
- [ ] **/[id]/settings** - Paramètres compte
- [ ] **Authentification** - Redirection si non connecté

#### 4. Tests Système de Réservation (2-3h)
- [ ] **Page booking** - Formulaire sélection espace
- [ ] **Calcul prix** - API calcule correctement
- [ ] **Confirmation** - Page récapitulatif
- [ ] **Checkout** - Intégration Stripe
- [ ] **Success** - Page confirmation après paiement
- [ ] **Webhook Stripe** - Mise à jour statut booking

#### 5. Tests Responsive (1h)
- [ ] **Mobile** (375px) - Navigation, formulaires
- [ ] **Tablet** (768px) - Layout adapté
- [ ] **Desktop** (1200px+) - Affichage optimal

**📋 Document de Test** : Créer `TESTS_RESULTS.md` avec :
- Pages testées ✅ / ❌
- Bugs identifiés
- APIs testées
- Points à améliorer

---

### Phase B : Refactorisation Progressive (7 jours)

**Référence complète** : Voir `REFACTORISATION_PLAN.md`

**Objectif** : Améliorer qualité du code SANS casser les fonctionnalités

#### Jour 1-2 : Types `any` Critiques
**Objectif** : Éliminer `any` types dans composants critiques

**Actions** :
```bash
# 1. Identifier tous les any types
grep -r "any" src/components/ --include="*.tsx" | wc -l

# 2. Créer types partagés
src/types/
├── site.ts          # HeroData, NavMenuItem
├── booking.ts       # BookingFormData
├── space.ts         # SpaceData
└── api.ts           # ApiResponse<T>
```

**Priorité P1 (Critique)** :
- Props de Header, Footer, Booking
- Hooks personnalisés
- Utilitaires partagés

**Résultat attendu** :
- 0 `any` types dans composants P1
- `pnpm type-check` réussit
- Site fonctionne identiquement

---

#### Jour 3-4 : Découper Fichiers > 200 Lignes
**Objectif** : Rendre code plus maintenable

**Actions** :
```bash
# Identifier fichiers longs
find src/ -name "*.tsx" | xargs wc -l | sort -rn | head -20
```

**Stratégie de découpage** :
```
❌ AVANT : booking/page.tsx (350 lignes)

✅ APRÈS :
booking/
├── page.tsx (80 lignes)           # Page principale
├── useBookingForm.ts (120 lignes) # Hook logique
├── BookingFormUI.tsx (100 lignes) # UI component
└── BookingSteps.tsx (50 lignes)   # Steps indicator
```

**Pages à découper** :
- `booking/page.tsx`
- `[id]/page.tsx` (Dashboard)
- `blog/[slug]/page.tsx`
- Composants Header, Footer

**Résultat attendu** :
- Tous fichiers < 200 lignes
- Logique extraite dans hooks
- UI séparée de la logique

---

#### Jour 5-6 : Composants Réutilisables
**Objectif** : Éliminer duplication

**Patterns à généraliser** :
```typescript
// ❌ AVANT : Duplication
<HeroOne />
<HeroTwo />
<HeroThree />

// ✅ APRÈS : Composant flexible
<Hero variant="full" title="..." image="...">
  <CustomContent />
</Hero>
```

**Composants à créer** :
- `Hero` (remplace HeroOne, Two, Three)
- `Card` (remplace ProjectCard, BlogCard, SpaceCard)
- `Section` (remplace AboutOne, AboutTwo)

**Migration progressive** :
1. Créer composant générique
2. Tester avec 1-2 usages
3. Si OK, migrer tous
4. Supprimer anciens composants

**Résultat attendu** :
- 3+ composants génériques
- Duplication réduite de 50%+
- Code mort supprimé

---

#### Jour 7 : Validation Finale
**Objectif** : Vérifier que tout fonctionne

**Tests complets** :
- [ ] Toutes pages testées manuellement
- [ ] Responsive OK (mobile, tablet, desktop)
- [ ] `pnpm type-check` : 0 errors
- [ ] `pnpm build` : Build successful
- [ ] `pnpm lint` : 0 errors
- [ ] Lighthouse : Score > 85

**Documentation** :
- [ ] Mettre à jour CLAUDE.md
- [ ] Documenter composants génériques
- [ ] Mettre à jour TODO.md

---

## 🎯 Principes de Refactorisation

### ✅ CE QU'ON FAIT
- Améliorer la **qualité** du code
- Typer correctement (éliminer `any`)
- Découper les gros fichiers
- Créer composants réutilisables
- Respecter les conventions SEO
- Appliquer les bonnes pratiques CLAUDE.md

### ❌ CE QU'ON NE FAIT PAS
- Changer les **textes** ou **contenus**
- Modifier les **mises en page** visuelles
- Supprimer des **fonctionnalités**
- Tout réécrire depuis `/source/`
- Forcer des changements si bloqué

### 🔒 Règles de Sécurité

**1. Tester après CHAQUE changement**
```bash
# Après chaque modif :
curl http://localhost:3000/[page-modifiée]
# Vérifier que ça fonctionne
```

**2. Commits fréquents (toutes les 1-2h)**
```bash
git add .
git commit -m "refactor: [description précise]"
git push origin main
```

**3. Stabilité > Pureté**
- Si un changement casse quelque chose → ANNULER
- Si incertain → DEMANDER avant de continuer
- Si bloqué → Passer au suivant

**4. Suivre les conventions**
- **Types** : Zéro `any`, interfaces explicites
- **Dates** : Toujours en string (`YYYY-MM-DD`, `HH:mm`)
- **SCSS** : BEM modifié (`.page-name__element--modifier`)
- **Composants** : Props typées, < 200 lignes
- **SEO** : `generateMetadata()`, Schema.org, next/image

---

## 📋 Checklist Quotidienne

**Avant de commencer** :
- [ ] Pull latest changes
- [ ] Vérifier que le site fonctionne
- [ ] Lire la tâche du jour
- [ ] Créer branche si risqué

**Avant de finir** :
- [ ] Tester manuellement
- [ ] Build TypeScript OK
- [ ] Commit descriptif
- [ ] Push sur GitHub

---

## 📊 Métriques de Succès

### Code Quality
- ✅ 0 `any` types (ou < 5 justifiés)
- ✅ Tous fichiers < 200 lignes
- ✅ Duplication réduite de 50%+
- ✅ Build TypeScript réussit

### Fonctionnalité
- ✅ Site fonctionne identiquement
- ✅ Aucune régression visuelle
- ✅ Toutes pages accessibles
- ✅ Responsive OK

### Performance
- ✅ Lighthouse score > 85
- ✅ Build time < 2 min
- ✅ 0 warnings TypeScript

---

## ✅ 13. CHECKLIST AVANT PROD

### Sécurité

- [ ] **Variables d'environnement** : Aucun secret en dur dans le code
- [ ] **Auth** : Toutes routes dashboard protégées
- [ ] **HTTPS** : Certificat SSL configuré
- [ ] **CORS** : Configuré correctement pour les APIs
- [ ] **Rate limiting** : Protection contre spam (formulaires, APIs)
- [ ] **SQL Injection** : Queries paramétrées (Mongoose = OK)
- [ ] **XSS** : Inputs sanitisés
- [ ] **CSRF** : Protection activée

### Performance

- [ ] **Lighthouse Desktop** : Score > 90
- [ ] **Lighthouse Mobile** : Score > 85
- [ ] **LCP** : < 2.5s
- [ ] **FID** : < 100ms
- [ ] **CLS** : < 0.1
- [ ] **Images** : Toutes optimisées (WebP/AVIF)
- [ ] **Fonts** : Préchargées (next/font)
- [ ] **JS Bundle** : < 200kb (gzipped)

### SEO

- [ ] **Sitemap** : Généré dynamiquement (`/sitemap.xml`)
- [ ] **Robots.txt** : Configuré (`/robots.txt`)
- [ ] **Metadata** : Toutes pages avec metadata
- [ ] **Schema.org** : LocalBusiness, Article, Breadcrumb
- [ ] **Open Graph** : Images OG (1200x630)
- [ ] **Canonical URLs** : Sur toutes les pages
- [ ] **404 Page** : Personnalisée

### Tests

- [ ] **Pages** : Toutes testées manuellement
- [ ] **Booking flow** : Complet (sélection → paiement → confirmation)
- [ ] **Webhook Stripe** : Testé avec Stripe CLI
- [ ] **Auth** : Login/Register/Logout
- [ ] **Responsive** : Mobile, Tablet, Desktop
- [ ] **Cross-browser** : Chrome, Firefox, Safari

### Build

```bash
# 1. Type-check
pnpm type-check
# → 0 errors

# 2. Lint
pnpm lint
# → 0 errors

# 3. Build
pnpm build
# → Build successful

# 4. Test build en local
pnpm start
# → Tester toutes les fonctionnalités
```

---

## 📖 14. GUIDE MIGRATION

### Workflow: Analyser → Comprendre → Réécrire

**RÈGLE ABSOLUE** : JAMAIS copier-coller depuis `src-old/`. Toujours utiliser `/source/` comme référence.

#### Étape 1: Analyser

```bash
# Lire le fichier original (LA bonne source)
cat /Users/twe/Developer/Thierry/coworking-cafe/source/src/app/(site)/booking/page.tsx

# Identifier:
# - Quelle est la fonctionnalité ?
# - Quelles sont les dépendances ?
# - Y a-t-il du code réutilisable ?
# - Quels sont les problèmes (any types, fichier trop long, etc.) ?
```

#### Étape 2: Comprendre

- Dessiner le flow sur papier
- Identifier les états (state management)
- Lister les APIs appelées
- Comprendre la logique métier

#### Étape 3: Réécrire

**Exemple** : Migration d'une page booking

```typescript
// ❌ ANCIEN CODE (/source/src/app/(site)/booking/page.tsx) - 450 lignes
// Analyser pour comprendre la logique, mais NE PAS copier
export function BookingPage() {
  // 200 lignes de state
  // 100 lignes de handlers
  // 150 lignes de JSX
}

// ✅ NOUVEAU CODE - Découpage

// 1. Hook (hooks/useBookingForm.ts) - 120 lignes
export function useBookingForm() {
  // State + validation + submit
}

// 2. Composant principal (app/(site)/booking/page.tsx) - 80 lignes
export default function BookingPage() {
  const { formData, errors, handleSubmit } = useBookingForm();
  return <BookingFormUI {...formData} errors={errors} onSubmit={handleSubmit} />;
}

// 3. Composant UI (components/booking/BookingFormUI.tsx) - 100 lignes
export function BookingFormUI(props) {
  return (
    <form>
      <SpaceSelector />
      <DateTimePicker />
      <BookingSummary />
    </form>
  );
}

// 4. Sous-composants (60 lignes chacun)
// - SpaceSelector.tsx
// - DateTimePicker.tsx
// - BookingSummary.tsx
```

### Exemples Transformation Code

#### Exemple 1: Dates

```typescript
// ❌ ANCIEN CODE
const booking = {
  date: new Date("2026-01-21T00:00:00.000Z"),
  startTime: new Date("2026-01-21T09:00:00.000Z")
};

// ✅ NOUVEAU CODE
const booking = {
  date: "2026-01-21",
  startTime: "09:00"
};
```

#### Exemple 2: Types

```typescript
// ❌ ANCIEN CODE
function processBooking(data: any) {
  return fetch('/api/booking', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ✅ NOUVEAU CODE
interface BookingData {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function processBooking(data: BookingData): Promise<ApiResponse<Booking>> {
  const response = await fetch('/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return response.json();
}
```

#### Exemple 3: Composants

```tsx
// ❌ ANCIEN CODE - Duplication
function HeroOne() {
  return <section className="hero1">...</section>;
}

function HeroTwo() {
  return <section className="hero2">...</section>;
}

// ✅ NOUVEAU CODE - Composant flexible
interface HeroProps {
  variant?: 'default' | 'full';
  children: React.ReactNode;
}

function Hero({ variant = 'default', children }: HeroProps) {
  return (
    <section className={cn('hero', `hero--${variant}`)}>
      {children}
    </section>
  );
}

// Usage
<Hero variant="full">
  <CustomContent />
</Hero>
```

---

## ❓ 15. FAQ

### Général

**Q: Puis-je copier-coller du code depuis src-old/ ou /source/ ?**
R: **NON**. Toujours analyser → comprendre → réécrire.
- `/source/` = référence fonctionnelle (analyser la logique)
- `src-old/` = ne JAMAIS utiliser (code modifié, bugs)

**Q: Comment gérer les dates ?**
R: Toujours en format string (`YYYY-MM-DD` pour dates, `HH:mm` pour heures). Jamais de timestamps ISO.

**Q: Taille maximale d'un fichier ?**
R: **200 lignes** pour composants/pages, **250 lignes** pour hooks. Si dépassé, découper.

**Q: Comment nommer les classes SCSS ?**
R: BEM modifié : `.page-name__block-element--modifier`. Jamais de camelCase.

### TypeScript

**Q: Puis-je utiliser `any` type ?**
R: **NON**. Utiliser `unknown` + type guards si vraiment nécessaire. Toujours typer explicitement.

**Q: Comment typer une réponse API ?**
R: Utiliser `ApiResponse<T>` :
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Q: Comment gérer les erreurs ?**
R: Utiliser `try/catch` ou Result pattern :
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

### Composants

**Q: Dois-je créer HeroOne, HeroTwo, etc. ?**
R: **NON**. Créer un seul composant `Hero` flexible avec `variant` et `children`.

**Q: Comment découper un composant trop long ?**
R: Extraire la logique dans un hook (`useXxx`), extraire l'UI en sous-composants.

**Q: Quelle convention de nommage pour les composants ?**
R: `PascalCase` pour composants, `camelCase` pour hooks/utils.

### Booking

**Q: Comment fonctionne le workflow de réservation ?**
R: 6 étapes :
1. Formulaire → 2. Calcul prix (API) → 3. Confirmation → 4. Payment Intent → 5. Paiement Stripe → 6. Webhook confirmation

**Q: Comment gérer les paiements Stripe ?**
R: Toujours utiliser `stripe` depuis `@coworking-cafe/database/lib/stripe`. Créer Payment Intent côté serveur, confirmer côté client.

**Q: Comment annuler une réservation ?**
R: Créer un refund Stripe (`stripe.refunds.create()`), puis mettre à jour le statut booking à `cancelled`.

### SEO

**Q: Comment ajouter SEO sur une page ?**
R: Utiliser `generateMetadata()` pour pages dynamiques, `export const metadata` pour pages statiques. Ajouter Schema.org JSON-LD.

**Q: Comment optimiser les images pour SEO ?**
R: Toujours utiliser `next/image` avec `alt` descriptif, `priority` pour images above-the-fold.

**Q: Faut-il créer un sitemap ?**
R: Oui, créer `app/sitemap.ts` avec pages statiques + articles blog dynamiques.

### Blog

**Q: Différence entre blog site et blog admin ?**
R: **Site** = Affichage articles publics. **Admin** = CMS (création/édition articles).

**Q: Comment afficher le contenu Markdown ?**
R: Utiliser `dangerouslySetInnerHTML` avec contenu sanitisé, ou librairie comme `react-markdown`.

**Q: Comment gérer les commentaires ?**
R: Model `Comment` dans DB, API `POST /api/blog/[slug]/comments`, composant `CommentSection`.

### Dashboard

**Q: Différence dashboard client vs admin ?**
R: **Client** (`/dashboard/*`) = Mes réservations, mon profil (rôle `client`). **Admin** (`apps/admin`) = Gestion complète (rôles `dev`, `admin`, `staff`).

**Q: Comment protéger les routes dashboard ?**
R: Middleware auth dans `layout.tsx` :
```typescript
const session = await getServerSession();
if (!session) redirect('/auth/login');
if (session.user.role !== 'client') redirect('/');
```

### Déploiement

**Q: Checklist avant déploiement ?**
R: Voir section 13 (Sécurité, Performance, SEO, Tests, Build).

**Q: Comment tester le webhook Stripe en local ?**
R: Utiliser Stripe CLI :
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Q: Comment vérifier qu'il n'y a pas de `any` types ?**
R: Exécuter :
```bash
pnpm type-check
# OU
grep -r "any" src/ --include="*.ts" --include="*.tsx"
```

---

**FIN DU DOCUMENT**

_Dernière mise à jour : 2026-01-21_
_Version : 3.0 - Documentation complète (2000+ lignes)_

