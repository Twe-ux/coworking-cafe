# Architecture Complète - packages/database

> **Date de création** : 2026-01-21
> **Objectif** : Centraliser TOUS les models Mongoose dans un package partagé
> **Scope** : Monorepo CoworKing Café (apps/site + apps/admin)

---

## 📋 Table des Matières

1. [Vision et Objectifs](#vision-et-objectifs)
2. [Structure Complète du Package](#structure-complète-du-package)
3. [Inventaire Complet des Models](#inventaire-complet-des-models)
4. [Schemas Détaillés par Model](#schemas-détaillés-par-model)
5. [Relations entre Models](#relations-entre-models)
6. [Indexes et Performance](#indexes-et-performance)
7. [Stratégie de Migration](#stratégie-de-migration)
8. [Breaking Changes et Impacts](#breaking-changes-et-impacts)
9. [Checklist de Migration](#checklist-de-migration)

---

## 🎯 Vision et Objectifs

### Problème Actuel

**Code dupliqué** :
- Models définis dans `/source/src/models/` (ancien projet)
- Models définis dans `/apps/admin/src/models/` (nouveau dashboard admin)
- Risque d'incohérence entre les deux sources

**Maintenance difficile** :
- Modification d'un model → Mettre à jour 2 endroits
- Types différents entre apps
- Logique métier dispersée

### Solution : Package Centralisé

```
packages/database/
└── Unique source de vérité pour TOUS les models
    ├── User, Employee, Role, Permission (Auth & HR)
    ├── Reservation, Space, Payment (Booking)
    ├── Article, Category, Comment (Blog)
    ├── Conversation, Message (Messaging)
    └── CashEntry, Turnover, TimeEntry (Admin)
```

**Avantages** :
- ✅ Une seule définition par model
- ✅ Types TypeScript partagés
- ✅ Logique métier centralisée (methods, hooks, virtuals)
- ✅ Facile à tester et maintenir
- ✅ Import simple : `import { User } from '@coworking-cafe/database'`

---

## 🏗️ Structure Complète du Package

```
packages/database/
├── package.json                    # Dependencies: mongoose, typescript
├── tsconfig.json                   # TypeScript config
├── src/
│   ├── index.ts                    # Exports principaux
│   ├── connection.ts               # MongoDB connection handler
│   │
│   ├── models/                     # TOUS les models Mongoose
│   │   │
│   │   ├── user/                   # ✅ Partagé (site + admin)
│   │   │   ├── index.ts
│   │   │   ├── document.ts
│   │   │   ├── methods.ts
│   │   │   ├── hooks.ts
│   │   │   └── virtuals.ts
│   │   │
│   │   ├── employee/               # ✅ Admin (RH)
│   │   │   ├── index.ts
│   │   │   ├── document.ts
│   │   │   ├── methods.ts
│   │   │   ├── hooks.ts
│   │   │   └── virtuals.ts
│   │   │
│   │   ├── reservation/            # ✅ Partagé (booking)
│   │   │   ├── index.ts
│   │   │   ├── document.ts
│   │   │   ├── methods.ts
│   │   │   ├── hooks.ts
│   │   │   └── virtuals.ts
│   │   │
│   │   ├── article/                # ✅ Partagé (blog)
│   │   ├── category/
│   │   ├── comment/
│   │   ├── space/
│   │   ├── payment/
│   │   ├── role/
│   │   ├── permission/
│   │   ├── session/
│   │   ├── conversation/
│   │   ├── message/
│   │   ├── additionalService/
│   │   ├── cashEntry/              # Admin comptabilité
│   │   ├── timeEntry/              # Admin pointage
│   │   ├── shift/                  # Admin planning
│   │   ├── availability/           # Admin RH
│   │   ├── turnover/               # Admin comptabilité
│   │   ├── media/
│   │   ├── tag/
│   │   ├── contactMail/
│   │   ├── newsletter/
│   │   ├── emailLog/
│   │   ├── promo/
│   │   ├── drink/
│   │   ├── food/
│   │   ├── globalHours/
│   │   ├── spaceConfiguration/
│   │   ├── shiftType/
│   │   ├── passwordResetToken/
│   │   ├── articleLike/
│   │   ├── articleRevision/
│   │   ├── commentLike/
│   │   └── pushSubscription/
│   │
│   ├── lib/                        # Utilitaires partagés
│   │   ├── stripe.ts               # Stripe client + helpers
│   │   ├── email.ts                # Email templates + sending
│   │   ├── utils.ts                # Fonctions génériques
│   │   └── validation.ts           # Validators communs
│   │
│   └── types/                      # Types TypeScript exportés
│       ├── index.ts
│       ├── user.ts
│       ├── booking.ts
│       ├── blog.ts
│       ├── hr.ts
│       ├── accounting.ts
│       └── common.ts
│
└── README.md                       # Documentation package
```

---

## 📊 Inventaire Complet des Models

### Classification par Usage

| Catégorie | Models | Apps Utilisatrices | Priorité |
|-----------|--------|-------------------|----------|
| **Auth & Users** | User, Role, Permission, Session | Site + Admin | 🔴 Haute |
| **HR & Staff** | Employee, Shift, Availability, TimeEntry | Admin | 🔴 Haute |
| **Booking** | Reservation, Space, SpaceConfiguration, AdditionalService, Payment | Site + Admin | 🔴 Haute |
| **Blog** | Article, Category, Comment, Tag, ArticleLike, CommentLike, ArticleRevision | Site + Admin | 🟡 Moyenne |
| **Messaging** | Conversation, Message | Site + Admin | 🟡 Moyenne |
| **Accounting** | CashEntry, Turnover | Admin | 🟡 Moyenne |
| **Media** | Media | Site + Admin | 🟢 Basse |
| **Contact** | ContactMail, Newsletter, EmailLog | Site + Admin | 🟢 Basse |
| **Config** | GlobalHours, BookingSettings, ShiftType | Site + Admin | 🟢 Basse |
| **Promo** | Promo | Site | 🟢 Basse |
| **Menu** | Drink, Food | Site | 🟢 Basse |
| **Misc** | PasswordResetToken, PushSubscription | Site + Admin | 🟢 Basse |

**Total** : 33 models

---

## 📝 Schemas Détaillés par Model

### 1. User (Auth)

**Fichier** : `models/user/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  username?: string;
  givenName?: string;
  phone?: string;
  companyName?: string;
  role: ObjectId;                   // → Role
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  newsletter: boolean;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    username: { type: String, trim: true },
    givenName: { type: String, trim: true },
    phone: { type: String, trim: true },
    companyName: { type: String, trim: true },
    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: [true, "User role is required"],
    },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    newsletter: { type: Boolean, default: false },
    isTemporary: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ deletedAt: 1 });
```

**Relations** :
- `role` → Role (ObjectId)

**Hooks** :
- Pre-save : Hacher le password avec bcrypt
- Post-save : Nettoyer les sessions expirées

**Virtuals** :
- `fullName` : Combiner givenName + username

---

### 2. Employee (HR)

**Fichier** : `models/employee/document.ts`

```typescript
import { Schema, Document, Types } from "mongoose";

export interface EmployeeDocument extends Document {
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;

  // Informations contractuelles
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number;
  hireDate: Date;
  hireTime?: string;
  endDate?: Date;
  endContractReason?: 'démission' | 'fin-periode-essai' | 'rupture';

  // Rémunération
  level: string;
  step: number;
  hourlyRate: number;
  monthlySalary?: number;

  // Code de pointage
  clockingCode: string;

  // Rôle employé (métier)
  employeeRole: 'Manager' | 'Employé';

  // Disponibilités horaires
  availability: {
    monday: { available: boolean; slots: Array<{ start: string; end: string }> };
    tuesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    wednesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    thursday: { available: boolean; slots: Array<{ start: string; end: string }> };
    friday: { available: boolean; slots: Array<{ start: string; end: string }> };
    saturday: { available: boolean; slots: Array<{ start: string; end: string }> };
    sunday: { available: boolean; slots: Array<{ start: string; end: string }> };
  };

  // Statut onboarding
  onboardingStatus: {
    step1Completed: boolean;
    step2Completed: boolean;
    step3Completed: boolean;
    step4Completed: boolean;
    dpaeCompleted: boolean;
    dpaeCompletedAt?: Date;
    medicalVisitCompleted: boolean;
    medicalVisitCompletedAt?: Date;
    mutuelleCompleted: boolean;
    mutuelleCompletedAt?: Date;
    bankDetailsProvided: boolean;
    bankDetailsProvidedAt?: Date;
    registerCompleted: boolean;
    registerCompletedAt?: Date;
    contractGenerated: boolean;
    contractGeneratedAt?: Date;
    contractSent: boolean;
    contractSentAt?: Date;
  };

  // Planning de travail
  workSchedule?: {
    weeklyDistribution: string;
    timeSlots: string;
    weeklyDistributionData?: { [key: string]: { [week: string]: string } };
  };

  // Coordonnées bancaires
  bankDetails?: {
    iban: string;
    bic: string;
    bankName: string;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse email valide"],
    },
    socialSecurityNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{15}$/, "Le numéro de sécurité sociale doit contenir 15 chiffres"],
    },
    contractType: {
      type: String,
      enum: ['CDI', 'CDD', 'Stage'],
      required: true,
    },
    contractualHours: { type: Number, required: true, min: 0 },
    hireDate: { type: Date, required: true },
    hireTime: { type: String, trim: true },
    endDate: { type: Date },
    endContractReason: {
      type: String,
      enum: ['démission', 'fin-periode-essai', 'rupture'],
    },
    level: { type: String, trim: true },
    step: { type: Number, min: 1 },
    hourlyRate: { type: Number, min: 0 },
    monthlySalary: { type: Number, min: 0 },
    clockingCode: {
      type: String,
      required: true,
      match: [/^\d{4}$/, "Le code de pointage doit contenir 4 chiffres"],
    },
    employeeRole: {
      type: String,
      enum: ['Manager', 'Employé'],
      required: true,
      default: 'Employé',
    },
    availability: {
      monday: { available: { type: Boolean, default: true }, slots: { type: [{ start: String, end: String }], default: [] } },
      tuesday: { available: { type: Boolean, default: true }, slots: { type: [{ start: String, end: String }], default: [] } },
      wednesday: { available: { type: Boolean, default: true }, slots: { type: [{ start: String, end: String }], default: [] } },
      thursday: { available: { type: Boolean, default: true }, slots: { type: [{ start: String, end: String }], default: [] } },
      friday: { available: { type: Boolean, default: true }, slots: { type: [{ start: String, end: String }], default: [] } },
      saturday: { available: { type: Boolean, default: false }, slots: { type: [{ start: String, end: String }], default: [] } },
      sunday: { available: { type: Boolean, default: false }, slots: { type: [{ start: String, end: String }], default: [] } },
    },
    onboardingStatus: {
      step1Completed: { type: Boolean, default: false },
      step2Completed: { type: Boolean, default: false },
      step3Completed: { type: Boolean, default: false },
      step4Completed: { type: Boolean, default: false },
      dpaeCompleted: { type: Boolean, default: false },
      dpaeCompletedAt: { type: Date },
      medicalVisitCompleted: { type: Boolean, default: false },
      medicalVisitCompletedAt: { type: Date },
      mutuelleCompleted: { type: Boolean, default: false },
      mutuelleCompletedAt: { type: Date },
      bankDetailsProvided: { type: Boolean, default: false },
      bankDetailsProvidedAt: { type: Date },
      registerCompleted: { type: Boolean, default: false },
      registerCompletedAt: { type: Date },
      contractGenerated: { type: Boolean, default: false },
      contractGeneratedAt: { type: Date },
      contractSent: { type: Boolean, default: false },
      contractSentAt: { type: Date },
    },
    workSchedule: {
      weeklyDistribution: { type: String },
      timeSlots: { type: String },
      weeklyDistributionData: { type: Object },
    },
    bankDetails: {
      iban: { type: String, trim: true },
      bic: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ socialSecurityNumber: 1 }, { unique: true });
EmployeeSchema.index({ clockingCode: 1 }, { unique: true });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ deletedAt: 1 });
EmployeeSchema.index({ hireDate: 1 });
```

**Methods** :
- `getFullName()` : Retourne "Prénom Nom"
- `getOnboardingProgress()` : Retourne % de complétion (0-100)
- `isOnboardingComplete()` : Retourne true si tous les steps validés

**Virtuals** :
- `fullName` : Combiner firstName + lastName

---

### 3. Reservation (Booking)

**Fichier** : `models/reservation/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface AdditionalServiceItem {
  service: ObjectId;                // → AdditionalService
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReservationDocument extends Document {
  user: ObjectId;                    // → User
  space?: ObjectId;                  // → Space (DEPRECATED)
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel" | "desk" | "meeting-room" | "meeting-room-glass" | "meeting-room-floor" | "private-office" | "event-space";
  date: Date;
  startTime?: string;                // Format "HH:mm"
  endTime?: string;                  // Format "HH:mm"
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  attendanceStatus?: "present" | "absent";

  // Pricing
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  reservationType?: "hourly" | "daily" | "weekly" | "monthly";

  // Contact
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Services supplémentaires
  additionalServices: AdditionalServiceItem[];

  // Payment
  requiresPayment: boolean;
  notes?: string;
  specialRequests?: string;
  confirmationNumber?: string;
  isPartialPrivatization?: boolean;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded" | "failed" | "partial";
  paymentMethod?: "card" | "cash" | "bank-transfer";
  amountPaid?: number;
  invoiceOption?: boolean;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSetupIntentId?: string;
  captureMethod?: "automatic" | "manual" | "deferred";

  // Cancellation
  cancelledAt?: Date;
  cancellationFee?: number;
  refundAmount?: number;
  cancelledBy?: ObjectId;           // → User

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const ReservationSchema = new Schema<ReservationDocument>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    space: {
      type: Types.ObjectId,
      ref: "Space",
      required: false,
      index: true,
    },
    spaceType: {
      type: String,
      enum: ["open-space", "salle-verriere", "salle-etage", "evenementiel", "desk", "meeting-room", "meeting-room-glass", "meeting-room-floor", "private-office", "event-space"],
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ["present", "absent"],
    },
    basePrice: { type: Number, required: true, min: 0, default: 0 },
    servicesPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    reservationType: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
    },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    additionalServices: {
      type: [
        {
          service: { type: Types.ObjectId, ref: "AdditionalService", required: true },
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1, default: 1 },
          unitPrice: { type: Number, required: true, min: 0 },
          totalPrice: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
    requiresPayment: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 500 },
    specialRequests: { type: String, trim: true, maxlength: 1000 },
    confirmationNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    isPartialPrivatization: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["unpaid", "pending", "paid", "refunded", "failed", "partial"],
      default: "unpaid",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "bank-transfer"],
    },
    amountPaid: { type: Number, min: 0, default: 0 },
    invoiceOption: { type: Boolean, default: false },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    stripeSessionId: { type: String, trim: true },
    stripeCustomerId: { type: String, trim: true },
    stripeSetupIntentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    captureMethod: {
      type: String,
      enum: ["automatic", "manual", "deferred"],
    },
    cancelledAt: { type: Date },
    cancellationFee: { type: Number, min: 0, default: 0 },
    refundAmount: { type: Number, min: 0, default: 0 },
    cancelledBy: { type: Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ReservationSchema.index({ user: 1, date: 1 });
ReservationSchema.index({ space: 1, date: 1 });
ReservationSchema.index({ status: 1, date: 1 });
ReservationSchema.index({ date: 1, spaceType: 1 });
ReservationSchema.index({
  space: 1,
  date: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});
```

**Relations** :
- `user` → User (ObjectId)
- `space` → Space (ObjectId, deprecated)
- `additionalServices[].service` → AdditionalService (ObjectId)
- `cancelledBy` → User (ObjectId)

**Methods** :
- `calculateTotalPrice()` : Recalculer le prix total
- `canBeCancelled()` : Vérifier si annulation possible
- `generateConfirmationNumber()` : Générer numéro de confirmation

**Hooks** :
- Pre-save : Générer confirmationNumber si manquant
- Post-save : Envoyer email de confirmation

**Virtuals** :
- `isUpcoming` : Retourne true si date future
- `isPast` : Retourne true si date passée

---

### 4. Space (Booking)

**Fichier** : `models/space/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export type SpaceAmenity =
  | "wifi"
  | "projector"
  | "whiteboard"
  | "coffee"
  | "printer"
  | "phone"
  | "tv"
  | "air-conditioning"
  | "natural-light"
  | "standing-desk"
  | "ergonomic-chair"
  | "locker"
  | "kitchen-access"
  | "parking";

export type SpaceType = "desk" | "meeting-room" | "private-office" | "event-space";

export interface AvailabilitySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;                 // Format "HH:mm"
  endTime: string;                   // Format "HH:mm"
  isAvailable: boolean;
}

export interface SpacePricing {
  hourly?: number;
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface SpaceDocument extends Document {
  name: string;
  slug: string;
  description: string;
  type: SpaceType;
  capacity: number;
  floor?: string;
  building?: string;
  pricing: SpacePricing;
  amenities: SpaceAmenity[];
  images: string[];
  featuredImage?: string;
  availability: AvailabilitySchedule[];
  isActive: boolean;
  isDeleted: boolean;
  viewCount: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const SpaceSchema = new Schema<SpaceDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: {
      type: String,
      required: true,
      enum: ["desk", "meeting-room", "private-office", "event-space"],
      index: true,
    },
    capacity: { type: Number, required: true, min: 1, max: 100 },
    floor: { type: String, trim: true },
    building: { type: String, trim: true },
    pricing: {
      hourly: { type: Number, min: 0 },
      daily: { type: Number, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
    },
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "projector",
          "whiteboard",
          "coffee",
          "printer",
          "phone",
          "tv",
          "air-conditioning",
          "natural-light",
          "standing-desk",
          "ergonomic-chair",
          "locker",
          "kitchen-access",
          "parking",
        ],
      },
    ],
    images: [{ type: String, trim: true }],
    featuredImage: { type: String, trim: true },
    availability: [
      {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
        },
        isAvailable: { type: Boolean, required: true, default: true },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
    bookingCount: { type: Number, default: 0, min: 0 },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
SpaceSchema.index({ type: 1, isActive: 1 });
SpaceSchema.index({ isActive: 1, isDeleted: 1 });
SpaceSchema.index({ "pricing.hourly": 1 });
SpaceSchema.index({ "pricing.daily": 1 });
SpaceSchema.index({ capacity: 1 });
SpaceSchema.index({ name: "text", description: "text" });
```

**Methods** :
- `isAvailableOn(date: Date)` : Vérifier dispo à une date
- `getPriceFor(type: 'hourly'|'daily'|'weekly'|'monthly')` : Obtenir tarif

**Hooks** :
- Pre-save : Générer slug depuis name
- Post-save : Mettre à jour le cache

**Virtuals** :
- `averageRating` : Note moyenne si système de reviews

---

### 5. Article (Blog)

**Fichier** : `models/article/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface ArticleDocument extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: ObjectId;                  // → User
  category: ObjectId;                // → Category
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  status: "draft" | "published" | "archived" | "scheduled";
  publishedAt?: Date;
  scheduledFor?: Date;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const ArticleSchema = new Schema<ArticleDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    featuredImage: { type: String },
    featuredImageAlt: { type: String, trim: true },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: false,
    },
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    metaKeywords: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
    },
    publishedAt: { type: Date },
    scheduledFor: { type: Date },
    viewCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ isFeatured: 1, status: 1 });
ArticleSchema.index({ isDeleted: 1 });
ArticleSchema.index({ deletedAt: 1 });
ArticleSchema.index({ title: "text", content: "text" });
```

**Relations** :
- `author` → User (ObjectId)
- `category` → Category (ObjectId)

**Methods** :
- `publish()` : Publier l'article (changer status + publishedAt)
- `incrementViewCount()` : Incrémenter viewCount

**Hooks** :
- Pre-save : Générer slug depuis title
- Post-save : Mettre à jour articleCount de la catégorie

**Virtuals** :
- `readingTime` : Temps de lecture estimé (basé sur word count)
- `isPublished` : Retourne true si status = "published"

---

### 6. Category (Blog)

**Fichier** : `models/category/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: ObjectId;                 // → Category (self-ref)
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  articleCount: number;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    parent: {
      type: Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: { type: String },
    icon: { type: String },
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid hex color"],
    },
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    articleCount: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isVisible: 1 });
```

**Relations** :
- `parent` → Category (ObjectId, self-reference)

**Methods** :
- `getChildren()` : Retourne les catégories enfants
- `getParentChain()` : Retourne la chaîne de catégories parentes

**Virtuals** :
- `hasArticles` : Retourne true si articleCount > 0

---

### 7. Comment (Blog)

**Fichier** : `models/comment/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface CommentDocument extends Document {
  content: string;
  article: ObjectId;                 // → Article
  user: ObjectId;                    // → User
  parent?: ObjectId;                 // → Comment (self-ref)
  status: "pending" | "approved" | "rejected" | "spam";
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const CommentSchema = new Schema<CommentDocument>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    article: {
      type: Types.ObjectId,
      ref: "Article",
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
    },
    likeCount: { type: Number, default: 0, min: 0 },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CommentSchema.index({ article: 1, status: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ deletedAt: 1 });
```

**Relations** :
- `article` → Article (ObjectId)
- `user` → User (ObjectId)
- `parent` → Comment (ObjectId, self-reference)

**Methods** :
- `approve()` : Approuver le commentaire
- `reject()` : Rejeter le commentaire
- `markAsSpam()` : Marquer comme spam

---

### 8. Role (Auth)

**Fichier** : `models/role/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export interface RoleDocument extends Document {
  name: string;
  slug: "dev" | "admin" | "manager" | "staff" | "client";
  description?: string;
  level: number;
  permissions: ObjectId[];           // → Permission[]
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["dev", "admin", "manager", "staff", "client"],
    },
    description: { type: String, trim: true },
    level: {
      type: Number,
      required: true,
      default: 10,
      // dev=100, admin=80, staff=50, client=10
    },
    permissions: [
      {
        type: Types.ObjectId,
        ref: "Permission",
      },
    ],
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RoleSchema.index({ slug: 1 }, { unique: true });
RoleSchema.index({ level: -1 });
```

**Relations** :
- `permissions[]` → Permission[] (ObjectId[])

**Methods** :
- `hasPermission(slug: string)` : Vérifier si permission existe
- `grantPermission(permissionId: ObjectId)` : Ajouter permission
- `revokePermission(permissionId: ObjectId)` : Retirer permission

---

### 9. Permission (Auth)

**Fichier** : `models/permission/document.ts`

```typescript
import { Schema, Document } from "mongoose";

export interface PermissionDocument extends Document {
  name: string;
  slug: string;
  resource:
    | "dashboard"
    | "users"
    | "blog"
    | "categories"
    | "tags"
    | "comments"
    | "media"
    | "settings";
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "manage"
    | "view-all"
    | "view-own"
    | "edit-all"
    | "edit-own"
    | "delete-all"
    | "delete-own"
    | "publish"
    | "moderate"
    | "access";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PermissionSchema = new Schema<PermissionDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "dashboard",
        "users",
        "blog",
        "categories",
        "tags",
        "comments",
        "media",
        "settings",
      ],
    },
    action: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "create",
        "read",
        "update",
        "delete",
        "manage",
        "view-all",
        "view-own",
        "edit-all",
        "edit-own",
        "delete-all",
        "delete-own",
        "publish",
        "moderate",
        "access",
      ],
    },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ slug: 1 }, { unique: true });
```

---

### 10. Conversation & Message (Messaging)

**Fichiers** :
- `models/conversation/document.ts`
- `models/message/document.ts`

```typescript
// Conversation
import { Document, ObjectId, Schema, Types } from "mongoose";

export type ConversationType = "direct" | "group";

export interface ConversationParticipant {
  user: ObjectId;                    // → User
  joinedAt: Date;
  lastReadAt?: Date;
  unreadCount: number;
}

export interface ConversationDocument extends Document {
  type: ConversationType;
  participants: ConversationParticipant[];
  name?: string;
  avatar?: string;
  description?: string;
  createdBy?: ObjectId;              // → User
  lastMessage?: ObjectId;            // → Message
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export const ConversationSchema = new Schema<ConversationDocument>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: [
      {
        user: { type: Types.ObjectId, ref: "User", required: true },
        joinedAt: { type: Date, required: true, default: Date.now },
        lastReadAt: { type: Date },
        unreadCount: { type: Number, default: 0 },
      },
    ],
    name: { type: String, trim: true },
    avatar: { type: String },
    description: { type: String, trim: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    lastMessage: { type: Types.ObjectId, ref: "Message" },
    lastMessageAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ConversationSchema.index({ "participants.user": 1 });
ConversationSchema.index({ type: 1, isDeleted: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Message
export type MessageType = "text" | "image" | "file" | "audio" | "video";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export interface MessageAttachment {
  url: string;
  type: "image" | "file" | "audio" | "video";
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface ReadReceipt {
  user: ObjectId;                    // → User
  readAt: Date;
}

export interface MessageDocument extends Document {
  conversation: ObjectId;            // → Conversation
  sender: ObjectId;                  // → User
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  status: MessageStatus;
  readBy: ReadReceipt[];
  replyTo?: ObjectId;                // → Message
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

export const MessageSchema = new Schema<MessageDocument>(
  {
    conversation: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "file", "audio", "video"],
          required: true,
        },
        name: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    readBy: [
      {
        user: { type: Types.ObjectId, ref: "User", required: true },
        readAt: { type: Date, required: true, default: Date.now },
      },
    ],
    replyTo: { type: Types.ObjectId, ref: "Message" },
    deletedAt: { type: Date },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ status: 1 });
```

---

### 11. Payment (Booking)

**Fichier** : `models/payment/document.ts`

```typescript
import { ObjectId, Schema, Types, Document } from "mongoose";

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded" | "cancelled";
export type PaymentMethodType = "card" | "cash" | "bank-transfer" | "wallet";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "diners" | "jcb" | "unionpay" | "unknown";

export interface PaymentMetadata {
  cardBrand?: CardBrand;
  cardLast4?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  receiptUrl?: string;
  receiptNumber?: string;
  refundReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
}

export interface PaymentDocument extends Document {
  booking: ObjectId;                 // → Reservation
  user: ObjectId;                    // → User
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeCustomerId?: string;
  stripeRefundId?: string;
  metadata?: PaymentMetadata;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export const PaymentSchema = new Schema<PaymentDocument>(
  {
    booking: {
      type: Types.ObjectId,
      ref: "Reservation",
      required: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "EUR",
      maxlength: 3,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "succeeded", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "cash", "bank-transfer", "wallet"],
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeChargeId: { type: String, trim: true, sparse: true },
    stripeCustomerId: { type: String, trim: true, index: true },
    stripeRefundId: { type: String, trim: true, sparse: true },
    metadata: {
      cardBrand: {
        type: String,
        enum: ["visa", "mastercard", "amex", "discover", "diners", "jcb", "unionpay", "unknown"],
      },
      cardLast4: { type: String, trim: true, maxlength: 4 },
      cardExpiryMonth: { type: Number, min: 1, max: 12 },
      cardExpiryYear: { type: Number, min: 2024 },
      receiptUrl: { type: String, trim: true },
      receiptNumber: { type: String, trim: true },
      refundReason: { type: String, trim: true, maxlength: 500 },
      refundedAmount: { type: Number, min: 0 },
      refundedAt: { type: Date },
    },
    description: { type: String, trim: true, maxlength: 500 },
    failureReason: { type: String, trim: true, maxlength: 500 },
    completedAt: { type: Date },
    failedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ booking: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true, unique: true });
```

---

### 12. TimeEntry (Admin HR)

**Fichier** : `models/timeEntry/document.ts`

```typescript
import { Schema, Types, Document } from 'mongoose';

export interface TimeEntryDocument extends Document {
  employeeId: Types.ObjectId;       // → Employee
  date: string;                     // Format "YYYY-MM-DD"
  clockIn: string;                  // Format "HH:mm"
  clockOut?: string | null;         // Format "HH:mm"
  shiftNumber: 1 | 2;
  totalHours?: number;
  status: 'active' | 'completed';
  hasError?: boolean;
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY';
  errorMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TimeEntrySchema = new Schema<TimeEntryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    clockIn: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Clock in must be in HH:mm format'],
    },
    clockOut: {
      type: String,
      default: null,
      match: [/^\d{2}:\d{2}$/, 'Clock out must be in HH:mm format'],
    },
    shiftNumber: {
      type: Number,
      required: true,
      enum: [1, 2],
      default: 1,
    },
    totalHours: { type: Number, min: 0, max: 24 },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    hasError: { type: Boolean, default: false },
    errorType: {
      type: String,
      enum: ['MISSING_CLOCK_OUT', 'INVALID_TIME_RANGE', 'DUPLICATE_ENTRY'],
    },
    errorMessage: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TimeEntrySchema.index({ employeeId: 1, date: 1 });
TimeEntrySchema.index({ employeeId: 1, date: 1, shiftNumber: 1 }, { unique: true });
TimeEntrySchema.index({ status: 1, isActive: 1 });
TimeEntrySchema.index({ date: 1, status: 1 });
```

**Methods** :
- `calculateTotalHours()` : Calculer total heures (clockOut - clockIn)

---

### 13-33. Autres Models (Résumé)

**Models restants** (structure complète dans les fichiers source) :

- **AdditionalService** : Services additionnels pour réservations
- **Shift** : Créneaux de travail planifiés
- **Availability** : Disponibilités employés
- **CashEntry** : Entrées de caisse (comptabilité)
- **Turnover** : Chiffre d'affaires par TVA
- **Media** : Gestion des fichiers uploads
- **Tag** : Tags pour articles
- **ContactMail** : Messages de contact
- **Newsletter** : Abonnés newsletter
- **EmailLog** : Logs d'emails envoyés
- **Promo** : Codes promo
- **Drink** : Boissons menu
- **Food** : Plats menu
- **GlobalHours** : Horaires d'ouverture globaux
- **SpaceConfiguration** : Configuration espaces
- **ShiftType** : Types de créneaux
- **PasswordResetToken** : Tokens reset password
- **ArticleLike** : Likes sur articles
- **ArticleRevision** : Versions d'articles
- **CommentLike** : Likes sur commentaires
- **PushSubscription** : Abonnements notifications push

---

## 🔗 Relations entre Models

### Diagramme des Relations Principales

```
User ━━━━━━━━━━┳━━━━━ Reservation (user)
               ┃
               ┣━━━━━ Article (author)
               ┃
               ┣━━━━━ Comment (user)
               ┃
               ┣━━━━━ Payment (user)
               ┃
               ┣━━━━━ Conversation.participants (user)
               ┃
               ┣━━━━━ Message (sender)
               ┃
               ┗━━━━━ Session (userId)

Employee ━━━━━━┳━━━━ TimeEntry (employeeId)
               ┃
               ┣━━━━ Shift (employeeId)
               ┃
               ┗━━━━ Availability (employeeId)

Reservation ━━━┳━━━━ Payment (booking)
               ┃
               ┣━━━━ Space (space) [deprecated]
               ┃
               ┗━━━━ AdditionalService (additionalServices[].service)

Article ━━━━━━━┳━━━━ Comment (article)
               ┃
               ┣━━━━ Category (category)
               ┃
               ┗━━━━ ArticleLike (article)

Role ━━━━━━━━━━┳━━━━ User (role)
               ┃
               ┗━━━━ Permission[] (permissions)

Conversation ━━┳━━━━ Message (conversation)
               ┃
               ┗━━━━ User[] (participants)
```

### Relations Détaillées

| Model A | Champ | Type | Model B | Cardinalité |
|---------|-------|------|---------|-------------|
| User | role | ObjectId | Role | 1:1 |
| User | - | - | Reservation | 1:N (via user) |
| User | - | - | Article | 1:N (via author) |
| User | - | - | Comment | 1:N (via user) |
| User | - | - | Payment | 1:N (via user) |
| User | - | - | Session | 1:N (via userId) |
| Employee | - | - | TimeEntry | 1:N (via employeeId) |
| Employee | - | - | Shift | 1:N (via employeeId) |
| Employee | - | - | Availability | 1:N (via employeeId) |
| Reservation | user | ObjectId | User | 1:1 |
| Reservation | space | ObjectId | Space | 1:1 (deprecated) |
| Reservation | additionalServices[].service | ObjectId | AdditionalService | N:N |
| Reservation | - | - | Payment | 1:1 (via booking) |
| Article | author | ObjectId | User | 1:1 |
| Article | category | ObjectId | Category | 1:1 |
| Article | - | - | Comment | 1:N (via article) |
| Comment | article | ObjectId | Article | 1:1 |
| Comment | user | ObjectId | User | 1:1 |
| Comment | parent | ObjectId | Comment | 1:1 (self-ref) |
| Category | parent | ObjectId | Category | 1:1 (self-ref) |
| Role | permissions[] | ObjectId[] | Permission | N:N |
| Conversation | participants[].user | ObjectId | User | N:N |
| Conversation | lastMessage | ObjectId | Message | 1:1 |
| Message | conversation | ObjectId | Conversation | 1:1 |
| Message | sender | ObjectId | User | 1:1 |
| Message | replyTo | ObjectId | Message | 1:1 (self-ref) |
| Payment | booking | ObjectId | Reservation | 1:1 |
| Payment | user | ObjectId | User | 1:1 |

---

## ⚡ Indexes et Performance

### Indexes Critiques (Impact Performance)

| Model | Index | Type | Raison |
|-------|-------|------|--------|
| **User** | `{ email: 1 }` | Unique | Login rapide |
| **User** | `{ username: 1 }` | Unique Sparse | Recherche utilisateur |
| **User** | `{ role: 1 }` | Simple | Filtrer par rôle |
| **Employee** | `{ email: 1 }` | Unique | Login RH |
| **Employee** | `{ socialSecurityNumber: 1 }` | Unique | Unicité sécu |
| **Employee** | `{ clockingCode: 1 }` | Unique | Pointage rapide |
| **Reservation** | `{ user: 1, date: 1 }` | Compound | Réservations utilisateur |
| **Reservation** | `{ space: 1, date: 1 }` | Compound | Disponibilité espace |
| **Reservation** | `{ date: 1, spaceType: 1 }` | Compound | Recherche par type |
| **Reservation** | `{ space: 1, date: 1, startTime: 1, endTime: 1, status: 1 }` | Compound | Éviter double bookings |
| **Article** | `{ status: 1, publishedAt: -1 }` | Compound | Articles publiés triés |
| **Article** | `{ title: "text", content: "text" }` | Text | Full-text search |
| **Comment** | `{ article: 1, status: 1, createdAt: -1 }` | Compound | Commentaires article |
| **Space** | `{ type: 1, isActive: 1 }` | Compound | Espaces par type |
| **Space** | `{ name: "text", description: "text" }` | Text | Recherche espaces |
| **TimeEntry** | `{ employeeId: 1, date: 1, shiftNumber: 1 }` | Unique Compound | Éviter doublons pointage |
| **TimeEntry** | `{ date: 1, status: 1 }` | Compound | Pointages par jour |
| **Payment** | `{ stripePaymentIntentId: 1 }` | Unique Sparse | Éviter doublons Stripe |
| **Conversation** | `{ participants.user: 1 }` | Array | Conversations utilisateur |
| **Message** | `{ conversation: 1, createdAt: -1 }` | Compound | Messages conversation |
| **Session** | `{ expiresAt: 1 }` | TTL | Auto-cleanup sessions |

### Stratégie d'Optimisation

1. **Indexes Uniques** : Préserver contraintes d'unicité (email, username, etc.)
2. **Indexes Composés** : Pour requêtes multi-critères fréquentes
3. **Indexes Text** : Pour recherche full-text (Article, Space)
4. **Indexes TTL** : Pour auto-cleanup (Session)
5. **Indexes Sparse** : Pour champs optionnels mais uniques

---

## 🚀 Stratégie de Migration

### Phase 1 : Préparation (1 jour)

**Objectif** : Créer le package et la structure

```bash
# 1. Créer le package
mkdir -p packages/database/src/models
cd packages/database

# 2. Initialiser package.json
cat > package.json << EOF
{
  "name": "@coworking-cafe/database",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

# 3. Créer tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# 4. Installer dependencies
pnpm install
```

### Phase 2 : Migration Models Prioritaires (3-4 jours)

**Ordre de migration** (par dépendances) :

#### Jour 1 : Auth & Users
- [ ] **Role** (aucune dépendance)
- [ ] **Permission** (aucune dépendance)
- [ ] **User** (→ Role)
- [ ] **Session** (→ User)

#### Jour 2 : HR & Staff
- [ ] **Employee** (aucune dépendance model)
- [ ] **TimeEntry** (→ Employee)
- [ ] **Shift** (→ Employee)
- [ ] **Availability** (→ Employee)

#### Jour 3 : Booking
- [ ] **Space** (aucune dépendance)
- [ ] **AdditionalService** (aucune dépendance)
- [ ] **Reservation** (→ User, Space, AdditionalService)
- [ ] **Payment** (→ User, Reservation)

#### Jour 4 : Blog & Messaging
- [ ] **Category** (aucune dépendance, self-ref)
- [ ] **Tag** (aucune dépendance)
- [ ] **Article** (→ User, Category)
- [ ] **Comment** (→ User, Article, self-ref)
- [ ] **Conversation** (→ User)
- [ ] **Message** (→ User, Conversation, self-ref)

### Phase 3 : Migration Models Secondaires (2 jours)

#### Jour 5-6 : Reste des Models
- [ ] **CashEntry** (Admin)
- [ ] **Turnover** (Admin)
- [ ] **Media** (→ User)
- [ ] **ContactMail** (→ User)
- [ ] **Newsletter** (→ User)
- [ ] **EmailLog** (aucune dépendance)
- [ ] **Promo** (aucune dépendance)
- [ ] **Drink** (aucune dépendance)
- [ ] **Food** (aucune dépendance)
- [ ] **GlobalHours** (aucune dépendance)
- [ ] **SpaceConfiguration** (aucune dépendance)
- [ ] **ShiftType** (aucune dépendance)
- [ ] **PasswordResetToken** (→ User)
- [ ] **ArticleLike** (→ User, Article)
- [ ] **ArticleRevision** (→ Article)
- [ ] **CommentLike** (→ User, Comment)
- [ ] **PushSubscription** (→ User)

### Phase 4 : Intégration Apps (2-3 jours)

#### 1. Mettre à jour apps/admin

```bash
# apps/admin/package.json
{
  "dependencies": {
    "@coworking-cafe/database": "workspace:*"
  }
}
```

```typescript
// apps/admin/src/app/api/hr/employees/route.ts
// AVANT
import { Employee } from '@/models/employee';

// APRÈS
import { Employee } from '@coworking-cafe/database';
```

**Tasks** :
- [ ] Remplacer tous les imports de models
- [ ] Supprimer `/apps/admin/src/models/` (sauf si logique spécifique)
- [ ] Tester toutes les APIs
- [ ] Build réussi

#### 2. Mettre à jour apps/site

```bash
# apps/site/package.json
{
  "dependencies": {
    "@coworking-cafe/database": "workspace:*"
  }
}
```

```typescript
// apps/site/src/app/api/booking/route.ts
// AVANT
import { Reservation } from '@/models/reservation';

// APRÈS
import { Reservation } from '@coworking-cafe/database';
```

**Tasks** :
- [ ] Remplacer tous les imports de models dans `/apps/site/src/app/api/`
- [ ] Remplacer imports dans `/apps/site/src/app/dashboard/` (si encore présent)
- [ ] Tester toutes les APIs
- [ ] Build réussi

#### 3. Supprimer Code Ancien

```bash
# Supprimer models source (après validation complète)
rm -rf /source/src/models/

# Garder uniquement packages/database
```

### Phase 5 : Validation & Documentation (1 jour)

- [ ] Tests complets end-to-end
- [ ] Vérifier performance (temps de réponse APIs)
- [ ] Documenter package dans `packages/database/README.md`
- [ ] Mettre à jour CLAUDE.md des apps

**Durée totale estimée** : 8-10 jours

---

## ⚠️ Breaking Changes et Impacts

### Breaking Changes Potentiels

#### 1. Chemins d'Import

**AVANT** :
```typescript
// apps/admin
import { Employee } from '@/models/employee';

// apps/site
import { User } from '@/models/user';
```

**APRÈS** :
```typescript
// Partout
import { Employee, User } from '@coworking-cafe/database';
```

**Impact** : 🔴 Élevé
- Modifier TOUS les fichiers qui importent des models
- Risque d'oublier des imports → Erreurs runtime

**Mitigation** :
- Utiliser recherche/remplacement global (`grep -r "from '@/models/"`)
- Vérifier TypeScript (`tsc --noEmit`)

#### 2. Structure Mongoose

**AVANT** : Models potentiellement initialisés différemment
```typescript
// Peut varier entre apps
const UserModel = model<UserDocument>('User', UserSchema);
```

**APRÈS** : Initialisation centralisée
```typescript
// packages/database/src/models/user/index.ts
export const User = models.User || model<UserDocument>('User', UserSchema);
```

**Impact** : 🟡 Moyen
- Possible conflit si models déjà initialisés dans l'app
- Mongoose cache les models → Peut causer erreurs

**Mitigation** :
- Utiliser pattern `models.User || model(...)` (déjà dans le code)
- Tester avec MongoDB connection fraîche

#### 3. Types TypeScript

**AVANT** : Types locaux
```typescript
// apps/admin/src/types/hr.ts
interface Employee { ... }
```

**APRÈS** : Types exportés du package
```typescript
// packages/database/src/types/hr.ts
export interface Employee { ... }
```

**Impact** : 🟡 Moyen
- Dupliquer types → Conflits
- Supprimer types locaux → Refactoring apps

**Mitigation** :
- Commencer par les types dans le package
- Supprimer types locaux progressivement
- Utiliser TypeScript pour détecter conflits

#### 4. Hooks et Methods

**AVANT** : Logique dans apps
```typescript
// apps/admin/src/models/employee/methods.ts
EmployeeSchema.methods.getFullName = function() { ... }
```

**APRÈS** : Logique centralisée
```typescript
// packages/database/src/models/employee/methods.ts
export function attachMethods(schema: Schema) {
  schema.methods.getFullName = function() { ... }
}
```

**Impact** : 🟢 Faible
- Code déjà structuré de manière modulaire
- Déplacer fichiers → Ajuster imports

**Mitigation** :
- Copier structure existante des models admin
- Tester methods après migration

#### 5. Connection MongoDB

**AVANT** : Connection dans chaque app
```typescript
// apps/admin/src/lib/mongodb.ts
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
```

**APRÈS** : Connection centralisée (optionnel)
```typescript
// packages/database/src/connection.ts
export async function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI);
}
```

**Impact** : 🟢 Faible
- Connection peut rester dans apps
- Ou utiliser helper centralisé

**Mitigation** :
- Garder connection dans apps pour flexibilité
- Package expose uniquement les models

---

## ✅ Checklist de Migration

### Avant de Commencer

- [ ] Backup de la base de données MongoDB
- [ ] Créer une branche Git dédiée : `feat/centralize-database-models`
- [ ] Lire ce document en entier
- [ ] S'assurer que `apps/admin` et `apps/site` buildent sans erreur
- [ ] Documenter les models customs/spécifiques à chaque app (si existent)

### Création du Package

- [ ] Créer structure `packages/database/`
- [ ] Initialiser `package.json` avec dependencies (mongoose, typescript)
- [ ] Créer `tsconfig.json` avec config appropriée
- [ ] Créer `src/index.ts` pour exports principaux
- [ ] Installer dependencies : `pnpm install`
- [ ] Build initial : `pnpm build` → Vérifier `dist/` généré

### Migration Model par Model

Pour chaque model :

- [ ] Créer dossier `src/models/[modelName]/`
- [ ] Créer `document.ts` : Schema + Interface + Indexes
- [ ] Créer `methods.ts` : Methods d'instance
- [ ] Créer `hooks.ts` : Pre/post hooks
- [ ] Créer `virtuals.ts` : Propriétés virtuelles
- [ ] Créer `index.ts` : Export + initialisation
- [ ] Ajouter export dans `src/index.ts` principal
- [ ] Build : `pnpm build` → Vérifier aucune erreur TypeScript
- [ ] Commit : `git commit -m "feat(database): add [ModelName] model"`

### Intégration dans apps/admin

- [ ] Ajouter dependency : `"@coworking-cafe/database": "workspace:*"`
- [ ] `pnpm install` dans le monorepo (root)
- [ ] Remplacer imports : `@/models/xxx` → `@coworking-cafe/database`
- [ ] Vérifier TypeScript : `cd apps/admin && pnpm type-check`
- [ ] Vérifier Build : `pnpm build`
- [ ] Tester APIs une par une (Postman/Thunder Client)
- [ ] Supprimer `/apps/admin/src/models/` (après validation)
- [ ] Commit : `git commit -m "feat(admin): use centralized database models"`

### Intégration dans apps/site

- [ ] Ajouter dependency : `"@coworking-cafe/database": "workspace:*"`
- [ ] `pnpm install` dans le monorepo (root)
- [ ] Remplacer imports dans `/apps/site/src/app/api/`
- [ ] Remplacer imports dans `/apps/site/src/app/dashboard/` (si existe)
- [ ] Vérifier TypeScript : `cd apps/site && pnpm type-check`
- [ ] Vérifier Build : `pnpm build`
- [ ] Tester site public (pages principales)
- [ ] Tester dashboard client (si encore présent)
- [ ] Commit : `git commit -m "feat(site): use centralized database models"`

### Nettoyage Final

- [ ] Supprimer `/source/src/models/` (ancien projet)
- [ ] Vérifier qu'aucun import vers `/source/` ne reste
- [ ] Grep global : `grep -r "from '@/models/'" apps/` → Doit être vide
- [ ] Grep global : `grep -r "source/src/models" .` → Doit être vide
- [ ] Build complet monorepo : `pnpm build` (root)
- [ ] Commit : `git commit -m "chore: remove old models directories"`

### Validation & Tests

- [ ] **Auth** : Login admin + Login site
- [ ] **HR** : CRUD employés, pointage, planning
- [ ] **Booking** : Créer réservation, paiement Stripe
- [ ] **Blog** : CRUD articles, commentaires
- [ ] **Messaging** : Envoyer/recevoir messages
- [ ] Vérifier logs serveur → Aucune erreur Mongoose
- [ ] Vérifier console navigateur → Aucune erreur
- [ ] Performance : Temps de réponse APIs < 500ms

### Documentation

- [ ] Créer `packages/database/README.md`
- [ ] Documenter exports principaux
- [ ] Documenter comment ajouter un nouveau model
- [ ] Mettre à jour `/apps/admin/CLAUDE.md`
- [ ] Mettre à jour `/apps/site/CLAUDE.md`
- [ ] Mettre à jour `/CLAUDE.md` (root)

### Merge & Déploiement

- [ ] Push branch : `git push origin feat/centralize-database-models`
- [ ] Créer Pull Request
- [ ] Review code (si en équipe)
- [ ] Merge dans main
- [ ] Déployer apps (si production)
- [ ] Monitor logs production (24h)

---

## 📌 Notes Importantes

### Préservation de la Structure MongoDB

**CRITIQUE** : Les models doivent conserver **exactement** la même structure que dans MongoDB actuelle pour permettre l'import de données.

**Règles** :
- ✅ Garder mêmes noms de champs
- ✅ Garder mêmes types (String, Number, Date, ObjectId)
- ✅ Nouveaux champs = optionnels (`?`)
- ❌ Ne PAS renommer de champs existants
- ❌ Ne PAS changer de types existants

**Exemple** :
```typescript
// ✅ BON - Structure préservée
interface Employee {
  firstName: string      // Même nom qu'en BD
  lastName: string       // Même nom qu'en BD
  email: string          // Même nom qu'en BD

  // Nouveau champ optionnel OK
  employeeRole?: 'Manager' | 'Employé'
}

// ❌ MAUVAIS - Structure changée
interface Employee {
  name: string           // ❌ Renommé de firstName
  mail: string           // ❌ Renommé de email
}
```

### Formats de Dates

**Convention stricte** : Utiliser **strings** pour dates/heures dans les models qui gèrent des plannings.

**Pourquoi ?**
- Évite bugs de timezone
- Plus facile à manipuler côté client
- Compatible avec affichage direct

**Exemples** :
```typescript
// ✅ BON
interface TimeEntry {
  date: string        // "2026-01-21"
  clockIn: string     // "09:00"
  clockOut: string    // "17:30"
}

// ✅ BON (dates absolues)
interface User {
  createdAt: Date     // Timestamps OK pour audit
  lastLoginAt: Date
}

// ⚠️ À ÉVITER (planning)
interface Reservation {
  date: Date          // Peut causer bugs timezone
  startTime: Date     // Difficile à afficher
}
```

### Structure Modulaire des Models

**Chaque model = 5 fichiers max** :

1. **index.ts** : Export + initialisation
2. **document.ts** : Schema + Interface + Indexes
3. **methods.ts** : Methods d'instance
4. **hooks.ts** : Pre/post hooks
5. **virtuals.ts** : Propriétés virtuelles

**Avantages** :
- Fichiers < 200 lignes
- Facile à naviguer
- Séparation des responsabilités

---

## 🎯 Conclusion

Ce document définit **l'architecture complète** de `packages/database` pour centraliser TOUS les models Mongoose du monorepo CoworKing Café.

**Durée totale estimée** : 8-10 jours de travail

**Bénéfices attendus** :
- ✅ Code unique et maintenable
- ✅ Types TypeScript partagés
- ✅ Logique métier centralisée
- ✅ Réduction de la dette technique
- ✅ Base solide pour scaling futur

**Prochaine étape** : Valider ce document avec l'équipe, puis démarrer **Phase 1 : Préparation**.

---

**Document créé le** : 2026-01-21
**Auteur** : Claude Sonnet 4.5
**Version** : 1.0
**Status** : ✅ Prêt pour implémentation
