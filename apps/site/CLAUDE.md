# CLAUDE.md - Site App Development Guide

> **App** : `/apps/site/` - Site Public + Dashboard Client du Coworking Café
> **Date de création** : 2026-01-16
> **Version** : 1.0
> **Status** : 🚧 En refactorisation

---

## 📋 Vue d'ensemble

Cette app Next.js 14 (App Router) contient :
- 🌐 **Site public** : Pages marketing, réservations, contact, blog
- 👤 **Dashboard client** : Gestion des réservations, messages, profil utilisateur

**Stack technique** :
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Bootstrap 5 + SCSS
- Redux Toolkit (state management)
- NextAuth.js (authentication)
- Stripe (paiements)
- MongoDB + packages partagés (@coworking-cafe/database)

---

## 🎯 Contexte Important

### Historique du Projet

**Projet migré depuis** : `/bt-coworkingcafe/` (ancien monolithe)
**Nouveau monorepo** : `/apps/site/` contient maintenant TOUT le code migré

**⚠️ IMPORTANT** : Il n'y a plus d'accès à l'ancien projet `bt-coworkingcafe/`. Tout a été migré ici.

### État Actuel

- ✅ Structure monorepo créée
- ✅ Code migré depuis l'ancien projet
- 🚧 **En cours** : Refactorisation complète pour respecter les conventions
- 📋 **À faire** : Appliquer les standards de qualité (voir ci-dessous)

---

## 🏗️ Architecture & Structure

### Structure des Dossiers

```
/apps/site/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (site)/                  # Site public
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── booking/             # Réservations publiques
│   │   │   ├── spaces/              # Espaces coworking
│   │   │   ├── take-away/           # Menu à emporter
│   │   │   ├── blog/                # Blog
│   │   │   ├── contact/             # Contact
│   │   │   └── auth/                # Login, Register, Forgot Password
│   │   ├── dashboard/               # Dashboard client
│   │   │   ├── (admin)/             # Routes admin
│   │   │   │   ├── booking/         # Gestion réservations
│   │   │   │   ├── users/           # Gestion utilisateurs
│   │   │   │   ├── menu/            # Gestion menu
│   │   │   │   ├── blog/            # Gestion blog
│   │   │   │   └── hr/              # Ressources humaines (legacy)
│   │   │   ├── settings/            # Paramètres utilisateur
│   │   │   ├── messages/            # Messagerie
│   │   │   ├── contact-mails/       # Mails de contact
│   │   │   └── promo/               # Promotions
│   │   └── api/                     # API Routes
│   │       ├── auth/                # NextAuth
│   │       ├── booking/             # APIs réservations
│   │       ├── users/               # APIs utilisateurs
│   │       └── stripe/              # Webhooks Stripe
│   ├── components/                  # Composants React
│   │   ├── layout/                  # Header, Footer, Nav
│   │   ├── ui/                      # Composants réutilisables
│   │   ├── booking/                 # Composants réservations
│   │   └── dashboard/               # Composants dashboard
│   ├── styles/                      # SCSS
│   │   ├── bootstrap/               # Overrides Bootstrap
│   │   ├── pages/                   # Styles par page
│   │   └── components/              # Styles composants
│   ├── lib/                         # Utilitaires
│   │   ├── stripe/                  # Helpers Stripe
│   │   └── utils/                   # Utilitaires généraux
│   ├── context/                     # React Context
│   │   └── AuthContext.tsx          # Contexte auth
│   ├── types/                       # Types TypeScript partagés
│   │   ├── booking.ts               # Types réservations
│   │   ├── user.ts                  # Types utilisateur
│   │   └── menu.ts                  # Types menu
│   └── public/                      # Assets statiques
│       ├── images/
│       ├── icons/
│       └── fonts/
└── CLAUDE.md                        # Ce fichier !
```

### Séparation Site Public vs Dashboard

**Site Public** (`app/(site)/`) :
- Pages marketing accessibles à tous
- Système de réservation public
- Blog, contact, CGU, confidentialité
- Pas d'authentification requise (sauf booking)

**Dashboard Client** (`app/dashboard/`) :
- Espace personnel authentifié
- Gestion des réservations
- Messagerie interne
- Paramètres de compte

---

## ✅ Conventions de Code (STRICTES)

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) {
  // ...
}

// ✅ CORRECT
interface BookingData {
  id: string
  spaceId: string
  startDate: string
  endDate: string
}

function handleData(data: BookingData) {
  // ...
}
```

**Règles** :
- ✅ Toujours typer les paramètres de fonction
- ✅ Toujours typer les retours de fonction
- ✅ Utiliser les types partagés de `/types/`
- ✅ Créer des interfaces plutôt que des types (sauf unions)
- ❌ Jamais `as any` sans justification documentée
- ❌ Jamais `@ts-ignore` ou `@ts-expect-error`

### 2. Formats de Dates et Heures

**RÈGLE STRICTE** : Toujours utiliser des **strings** pour les dates/heures en API

```typescript
// ❌ INTERDIT - Timestamps ISO avec timezone
{
  date: new Date("2026-01-16T00:00:00.000Z"),  // ❌ Cause des bugs de timezone
  startTime: new Date("2026-01-16T09:00:00.000Z") // ❌
}

// ✅ CORRECT - Strings simples
{
  date: "2026-01-16",    // Format YYYY-MM-DD
  startTime: "09:00",    // Format HH:mm
  endTime: "17:30"       // Format HH:mm
}
```

**Types à utiliser** :

```typescript
// /types/booking.ts
interface Booking {
  id: string
  userId: string
  spaceId: string
  date: string        // YYYY-MM-DD
  startTime: string   // HH:mm
  endTime: string     // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled'
}
```

### 3. Taille des Fichiers

| Type de fichier | Max lignes | Action si dépassé |
|-----------------|------------|-------------------|
| **Composants React** | 200 | Extraire sous-composants ou hooks |
| **Custom Hooks** | 150 | Séparer en hooks spécialisés |
| **Pages Next.js** | 150 | Logique → hooks, UI → composants |
| **API Routes** | 200 | Extraire validation/logique en utils |
| **Utils/Helpers** | 200 | Découper par responsabilité |

**Comment découper un gros composant :**

```typescript
// ❌ MAUVAIS - Tout dans un fichier (300 lignes)
export function BookingList() {
  // 50 lignes de logique
  // 50 lignes de state
  // 100 lignes de handlers
  // 100 lignes de JSX
}

// ✅ BON - Découpage propre

// hooks/useBookingList.ts (80 lignes)
export function useBookingList() {
  // Toute la logique ici
  return { bookings, loading, error, actions }
}

// components/booking/BookingList.tsx (120 lignes)
export function BookingList() {
  const { bookings, loading, error, actions } = useBookingList()

  if (loading) return <BookingListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <BookingHeader actions={actions} />
      <BookingTable bookings={bookings} />
      <BookingPagination />
    </div>
  )
}
```

### 4. Nommage

**Fichiers** :
- Composants : `PascalCase.tsx` (BookingCard.tsx)
- Hooks : `camelCase.ts` (useBookings.ts)
- Utils : `kebab-case.ts` (format-date.ts)
- Types : `camelCase.ts` (booking.ts)
- API routes : `route.ts` (convention Next.js)
- SCSS : `kebab-case.scss` (booking-card.scss)

**Nommage BEM Modifié pour SCSS** :

```scss
// ✅ BON - BEM modifié avec préfixe page
.home__hero
.home__hero-title
.home__hero-title--highlighted
.home__hero-cta

.booking__calendar
.booking__calendar-day
.booking__calendar-day--selected

// ❌ MAUVAIS
.hero-one
.heroTitle
.hero_title
.calendar1
```

**Variables** :
```typescript
// ❌ INTERDIT - Noms génériques
const data = await fetch(...)
const result = handleStuff()
const temp = booking

// ✅ CORRECT - Noms descriptifs
const bookingsData = await fetch(...)
const validationResult = handleValidation()
const activeBooking = booking
```

### 5. Bootstrap + SCSS

**Organisation SCSS** :

```scss
// styles/pages/booking.scss

// 1. Variables locales (si nécessaire)
$booking-primary: #your-color;

// 2. Utiliser les variables Bootstrap
.booking__container {
  padding: $spacer-3; // Variable Bootstrap
  background: $white;
  border-radius: $border-radius;
}

// 3. BEM modifié cohérent
.booking__card {
  // Styles du container
}

.booking__card-header {
  // Styles du header
}

.booking__card-title {
  // Styles du titre
}

.booking__card-title--highlighted {
  // Variante highlighted
}

// 4. Responsive avec mixins Bootstrap
@include media-breakpoint-down(md) {
  .booking__card {
    padding: $spacer-2;
  }
}
```

**Classes Bootstrap** :

```tsx
// ✅ BON - Utiliser les utilitaires Bootstrap quand approprié
<div className="container">
  <div className="row g-4">
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card booking__card">
        <div className="card-body">
          {/* Contenu */}
        </div>
      </div>
    </div>
  </div>
</div>

// ❌ MAUVAIS - Recréer des utilitaires Bootstrap en SCSS
.my-container {
  max-width: 1140px; // Existe déjà dans Bootstrap
  margin: 0 auto;
}
```

### 6. Composants Réutilisables

**Principe** : Créer des composants **flexibles avec children** plutôt que des variantes

```typescript
// ❌ MAUVAIS - Duplication
<HeroOne />
<HeroTwo />
<HeroThree />

// ✅ BON - Composant flexible
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>
```

**Pattern recommandé** :

```typescript
// components/ui/Card.tsx
interface CardProps {
  title?: string
  variant?: 'default' | 'outlined' | 'filled'
  children: React.ReactNode
  className?: string
}

export function Card({ title, variant = 'default', children, className }: CardProps) {
  return (
    <div className={`card card--${variant} ${className || ''}`}>
      {title && <div className="card-header"><h3>{title}</h3></div>}
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
```

---

## 🔒 Sécurité & Authentification

### Pattern d'Authentification (API Routes)

**NextAuth est utilisé pour l'authentification.**

```typescript
// /app/api/booking/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  // 1. Authentification
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ error: 'Non authentifié' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Autorisation (si nécessaire)
  if (session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 3. Logique métier
  try {
    const bookings = await getBookings(session.user.id)
    return new Response(JSON.stringify({ success: true, data: bookings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('GET /api/booking error:', error)
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### Routes Publiques vs Privées

**Routes publiques** (pas d'auth requise) :
- `/` - Home page
- `/spaces` - Liste des espaces
- `/blog` - Articles de blog
- `/contact` - Page de contact
- `/auth/*` - Login, register, forgot password
- `/api/auth/[...nextauth]` - NextAuth endpoint

**Routes privées** (auth requise) :
- `/dashboard/*` - Tout le dashboard
- `/api/booking/*` - APIs réservations
- `/api/users/*` - APIs utilisateurs

---

## 📦 Types Partagés (Single Source of Truth)

### Utiliser les Types Partagés

**RÈGLE** : Toujours importer depuis `/types/` plutôt que redéfinir localement

```typescript
// ❌ INTERDIT - Interface locale
interface Booking {
  id: string
  spaceId: string
  date: string
}

// ✅ CORRECT - Import depuis types partagés
import type { Booking } from '@/types/booking'
```

### Types Principaux

**`/types/booking.ts`** :
- `Booking` - Réservation complète
- `BookingFormData` - Formulaire de réservation
- `Space` - Espace coworking
- `BookingStatus` - Statuts possibles

**`/types/user.ts`** :
- `User` - Utilisateur complet
- `UserProfile` - Profil utilisateur
- `UserRole` - Rôles (user, admin, super_admin)

**`/types/menu.ts`** :
- `MenuItem` - Item du menu
- `MenuCategory` - Catégorie de menu
- `Order` - Commande

### Créer un Nouveau Type

Si tu dois créer un nouveau type partagé :

```typescript
// 1. Ajouter dans /types/monModule.ts
export interface MonNouveauType {
  id: string
  // ... champs
}

// 2. Utiliser partout
import type { MonNouveauType } from '@/types/monModule'
```

---

## 🌐 API Routes (Next.js)

### Structure d'une Route API

```typescript
// /app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { Booking } from '@/types/booking'

// GET /api/booking
export async function GET(request: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Query params
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  // 3. Logic
  try {
    const filter = status ? { status } : {}
    const bookings = await getBookings(session.user.id, filter)

    return NextResponse.json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('GET /api/booking error:', error)
    return NextResponse.json({
      error: 'Erreur lors de la récupération des réservations',
      details: error.message
    }, { status: 500 })
  }
}

// POST /api/booking
export async function POST(request: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Parse body
  try {
    const body = await request.json()

    // 3. Validation
    if (!body.spaceId || !body.date || !body.startTime) {
      return NextResponse.json({
        error: 'Données manquantes',
        details: 'spaceId, date, startTime sont requis'
      }, { status: 400 })
    }

    // 4. Business logic
    const booking = await createBooking({
      ...body,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      data: booking
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/booking error:', error)
    return NextResponse.json({
      error: 'Erreur lors de la création de la réservation',
      details: error.message
    }, { status: 500 })
  }
}
```

### Gestion d'Erreurs Standardisée

```typescript
// Toujours utiliser try/catch
try {
  // Logic
} catch (error) {
  // Log pour debug
  console.error('[Route] Error:', error)

  // Réponse utilisateur
  return NextResponse.json({
    error: 'Message utilisateur friendly',
    details: error.message, // Détails techniques
  }, { status: 500 }) // Status code approprié
}
```

### Status Codes Appropriés

| Code | Usage | Exemple |
|------|-------|------------|
| 200 | GET réussi | Liste de réservations |
| 201 | POST réussi (création) | Nouvelle réservation créée |
| 204 | DELETE réussi | Réservation annulée |
| 400 | Erreur validation | Champs manquants |
| 401 | Non authentifié | Pas de session |
| 403 | Permission refusée | Role insuffisant |
| 404 | Ressource introuvable | Réservation inexistante |
| 500 | Erreur serveur | Erreur DB, etc. |

---

## 🎨 Composants React

### Structure d'un Composant

```typescript
// components/booking/BookingCard.tsx
import type { Booking } from '@/types/booking'
import './BookingCard.scss'

/**
 * Card affichant les détails d'une réservation
 *
 * @param booking - Réservation à afficher
 * @param onCancel - Callback pour annuler
 * @param onEdit - Callback pour éditer
 */
interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: string) => void
  onEdit?: (booking: Booking) => void
}

export function BookingCard({ booking, onCancel, onEdit }: BookingCardProps) {
  return (
    <div className="card booking__card">
      <div className="card-body">
        <h5 className="card-title booking__card-title">
          {booking.spaceName}
        </h5>

        <p className="card-text">
          <strong>Date :</strong> {booking.date}<br />
          <strong>Horaire :</strong> {booking.startTime} - {booking.endTime}
        </p>

        <div className="d-flex gap-2">
          {onEdit && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onEdit(booking)}
            >
              Modifier
            </button>
          )}
          {onCancel && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onCancel(booking.id)}
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Hooks Personnalisés

**Extraire la logique dans des hooks custom** :

```typescript
// hooks/useBookings.ts
import { useState, useEffect } from 'react'
import type { Booking } from '@/types/booking'

interface UseBookingsOptions {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'all'
}

interface UseBookingsReturn {
  bookings: Booking[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status && options.status !== 'all') {
        params.set('status', options.status)
      }

      const response = await fetch(`/api/booking?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue')
      }

      setBookings(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [options.status])

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  }
}
```

---

## 🚧 Refactorisation en Cours

### Workflow de Refacto (par page/module)

#### Phase 1 : Analyse (30 min)

1. Identifier les problèmes du code actuel
2. Lister les composants à extraire
3. Vérifier les duplications
4. Planifier la structure cible

#### Phase 2 : Types (15 min)

1. Créer/mettre à jour les types dans `/types/`
2. Supprimer tous les `any`
3. Typer correctement les props et retours

#### Phase 3 : Découpage (1-2h)

1. Extraire la logique dans des hooks
2. Découper les gros composants (> 200 lignes)
3. Créer des sous-composants réutilisables
4. Respecter les limites de lignes

#### Phase 4 : SCSS (30 min)

1. Appliquer le nommage BEM modifié
2. Utiliser les variables Bootstrap
3. Harmoniser les styles
4. Supprimer le CSS dupliqué

#### Phase 5 : Tests (15 min)

1. Vérifier visuellement (responsive)
2. Tester les interactions
3. Vérifier console (pas d'erreurs)
4. Build réussi (`pnpm build`)

### Checklist Refacto

- [ ] Zéro `any` types
- [ ] Tous les fichiers < 200 lignes
- [ ] Types importés depuis `/types/`
- [ ] Dates/heures en format string (YYYY-MM-DD, HH:mm)
- [ ] Nommage BEM modifié pour SCSS
- [ ] Hooks custom pour logique > 50 lignes
- [ ] Composants réutilisables (pas de duplication)
- [ ] Pas d'erreurs TypeScript (`pnpm type-check`)
- [ ] Pas d'erreurs console (F12)
- [ ] Build réussi (`pnpm build`)

---

## 🧪 Tests

### Tests Manuels (OBLIGATOIRE)

**Avant chaque commit important** :

```bash
# Lire la checklist
# TESTING_CHECKLIST.md (à créer)

# Type check
pnpm type-check

# Build
pnpm build

# Lancer le serveur
pnpm dev

# Tester au minimum (5 min) :
# 1. Login
# 2. Navigation dans les pages modifiées
# 3. Créer/Modifier/Supprimer des données
# 4. Vérifier console (F12) - pas d'erreurs
# 5. Tester responsive (mobile, tablet, desktop)
```

---

## 🚫 Choses à ÉVITER Absolument

### ❌ Anti-Patterns

1. **Types `any`**
```typescript
// ❌ JAMAIS
const data: any = await fetch(...)
function process(item: any) {}
```

2. **Dates ISO avec timezone**
```typescript
// ❌ JAMAIS
{ date: new Date().toISOString() } // 2026-01-16T00:00:00.000Z
```

3. **Fichiers monolithiques**
```typescript
// ❌ JAMAIS - 500 lignes dans un composant
// Découper en sous-composants + hooks
```

4. **Duplication de code**
```typescript
// ❌ JAMAIS
<HeroOne />
<HeroTwo />
<HeroThree />

// ✅ TOUJOURS
<Hero variant={variant} />
```

5. **Nommage incohérent en SCSS**
```scss
// ❌ JAMAIS
.hero-one
.heroTitle
.hero_title

// ✅ TOUJOURS - BEM modifié
.home__hero
.home__hero-title
```

6. **Classes Bootstrap custom**
```scss
// ❌ JAMAIS - Recréer ce qui existe
.my-container {
  max-width: 1140px;
  margin: 0 auto;
}

// ✅ TOUJOURS - Utiliser Bootstrap
<div className="container">
```

---

## 📚 Ressources & Documentation

### Documentation Interne

- **Conventions root** : `/CLAUDE.md` (racine)
- **Conventions admin** : `/apps/admin/CLAUDE.md`
- **Architecture** : `/docs/CONVENTIONS.md` (si existe)

### Documentation Externe

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [SCSS Documentation](https://sass-lang.com/documentation/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe Docs](https://stripe.com/docs)

---

## 🎯 Checklist Avant de Coder

Avant de commencer une nouvelle feature :

- [ ] J'ai lu ce CLAUDE.md
- [ ] Je connais les types à utiliser (`/types/`)
- [ ] Je sais où placer mes fichiers (structure ci-dessus)
- [ ] Je respecterai les limites de lignes
- [ ] Je n'utiliserai pas `any`
- [ ] J'utiliserai des strings pour dates/heures
- [ ] J'utiliserai le nommage BEM modifié pour SCSS
- [ ] Je testerai manuellement avant de commit
- [ ] Je vérifierai que `pnpm build` passe

---

## 💡 En Cas de Doute

**Questions fréquentes** :

### "Où mettre ce nouveau fichier ?"
→ Consulte la section "Architecture & Structure"

### "Comment typer cette donnée ?"
→ Regarde dans `/types/`, sinon crée un nouveau type partagé

### "Cette API doit-elle être protégée ?"
→ OUI, sauf si c'est une page publique (home, blog, contact, auth)

### "Ce composant fait 300 lignes, c'est grave ?"
→ OUI, découpe-le en sous-composants + hook

### "Je peux utiliser `any` juste pour aller vite ?"
→ NON, prends 2 minutes pour typer correctement

### "Format Date ou string pour les dates ?"
→ **TOUJOURS string** (YYYY-MM-DD, HH:mm)

### "Bootstrap classes ou SCSS custom ?"
→ **Bootstrap classes** pour layout/spacing, **SCSS custom** pour styles spécifiques avec BEM

---

## 🚀 Prochaines Étapes

### Refactorisation Prioritaire

1. **Pages publiques** (site)
   - Home page
   - Pages booking
   - Pages espaces
   - Pages blog

2. **Dashboard client**
   - Gestion réservations
   - Paramètres utilisateur
   - Messagerie

3. **Composants réutilisables**
   - Extraire patterns récurrents
   - Créer bibliothèque de composants UI
   - Documentation Storybook (optionnel)

### Migration Future vers Admin

Certains modules du dashboard seront **migrés vers `/apps/admin/`** :
- HR (ressources humaines) - déjà en cours
- Gestion utilisateurs admin - à migrer
- Analytics avancées - à migrer

**Voir `/apps/admin/CLAUDE.md`** pour le workflow de migration.

---

## ✅ Status Actuel de l'App

**Version** : 1.0
**Status** : 🚧 En refactorisation

### Modules Implémentés

- ✅ **Site public** - Home, Spaces, Blog, Contact, CGU
- ✅ **Auth** - NextAuth avec login/register
- ✅ **Booking** - Système de réservation complet
- ✅ **Dashboard** - Espace personnel utilisateur
- ✅ **Stripe** - Paiements intégrés
- ✅ **Messages** - Système de messagerie

### Qualité du Code Actuelle

- ⚠️ **Types** : Beaucoup de `any` à corriger
- ⚠️ **Architecture** : Fichiers trop gros à découper
- ⚠️ **SCSS** : Nommage incohérent à harmoniser
- ⚠️ **Duplication** : Code dupliqué à factoriser

### Objectifs Refacto

- 🎯 **Types** : 0 `any`, types partagés partout
- 🎯 **Architecture** : Tous fichiers < 200 lignes
- 🎯 **SCSS** : BEM modifié cohérent partout
- 🎯 **Code** : Composants réutilisables, pas de duplication

---

**Dernière mise à jour** : 2026-01-16
**Auteur** : Thierry + Claude
**Version** : 1.0

---

*Ce document est LA référence pour développer dans `/apps/site/`. Respecte ces conventions et le code restera maintenable ! 🚀*
