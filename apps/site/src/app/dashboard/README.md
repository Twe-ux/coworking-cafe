# Dashboard Client

Dashboard pour les utilisateurs avec rôle `client`.

## 🎯 Fonctionnalités

### Pages Disponibles

- **`/dashboard`** - Overview (stats + dernières réservations)
- **`/dashboard/bookings`** - Liste complète des réservations
- **`/dashboard/bookings/[id]`** - Détail d'une réservation
- **`/dashboard/profile`** - Profil utilisateur
- **`/dashboard/messages`** - Messagerie
- **`/dashboard/settings`** - Paramètres

## 🔐 Authentification

Le layout dashboard vérifie:

1. **Session existante**: Redirection vers `/auth/login` si non connecté
2. **Rôle client**: Redirection vers `/` si rôle différent de `client`

```typescript
// app/dashboard/layout.tsx
const session = await getServerSession();

if (!session) {
  redirect('/auth/login?callbackUrl=/dashboard');
}

if (session.user.role.slug !== 'client') {
  redirect('/');
}
```

## 📊 Page Overview

### Stats Affichées

```typescript
interface DashboardStats {
  totalBookings: number;        // Total réservations
  thisMonthBookings: number;    // Réservations du mois
  totalSpent: number;           // Total dépensé (€)
  nextBooking: BookingData | null; // Prochaine réservation
}
```

### Dernières Réservations

Affiche les 5 dernières réservations avec:
- Nom de l'espace
- Date (format long français)
- Horaire (HH:mm - HH:mm)
- Prix total
- Status (badge coloré)

### CTA

Bouton principal "Réserver un espace" → `/booking`

## 🧩 Composants

### DashboardNav

**Props**:
```typescript
interface DashboardNavProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

**Fonctionnalités**:
- Navigation avec active state
- User menu (avatar, nom, email)
- Bouton logout
- Responsive mobile (drawer)

### DashboardStats

**Props**:
```typescript
interface DashboardStatsProps {
  totalBookings: number;
  thisMonthBookings: number;
  totalSpent: number;
  nextBooking: BookingData | null;
}
```

**Variants**:
- `primary` - Bleu
- `success` - Vert
- `warning` - Orange
- `info` - Cyan

## 🎨 Styles SCSS

### Classes Principales

```scss
.dashboard                        // Container principal
  &__sidebar                      // Sidebar fixe
    &--open                       // Sidebar ouverte (mobile)
  &__content                      // Zone de contenu
  &__nav                          // Navigation
    &-link                        // Lien de nav
      &--active                   // Lien actif
  &__user                         // Section utilisateur
    &-avatar                      // Avatar
    &-name                        // Nom
    &-email                       // Email
  &__logout                       // Bouton déconnexion

.dashboard-stats                  // Grid stats
  &__card                         // Card stat
    &--primary                    // Variant primaire
    &--success                    // Variant succès
    &--warning                    // Variant warning
    &--info                       // Variant info
  &__card-icon                    // Icon emoji
  &__card-label                   // Label
  &__card-value                   // Valeur

.dashboard__booking-card          // Card réservation
  &-header                        // Header avec titre
  &-body                          // Corps avec infos
  &-status                        // Badge status
    &--confirmed                  // Status confirmé
    &--pending                    // Status en attente
    &--cancelled                  // Status annulé
```

### Responsive

#### Desktop (> 768px)
- Sidebar fixe 280px à gauche
- Grid stats 4 colonnes

#### Mobile (< 768px)
- Header mobile fixe en haut
- Sidebar drawer (slide-in)
- Overlay dark
- Grid stats 1 colonne

## 🔌 APIs Requises

### GET `/api/user/stats`

**Query Params**:
- `userId` (string)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalBookings": 12,
    "thisMonthBookings": 3,
    "totalSpent": 245.50,
    "nextBooking": {
      "_id": "...",
      "spaceId": {
        "name": "Open Space",
        "type": "open-space"
      },
      "date": "2026-01-25",
      "startTime": "09:00",
      "endTime": "17:00",
      "totalPrice": 50.00,
      "status": "confirmed"
    }
  }
}
```

### GET `/api/user/bookings`

**Query Params**:
- `userId` (string)
- `limit` (number, optionnel, défaut: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "spaceId": {
        "_id": "...",
        "name": "Salle de Réunion",
        "type": "meeting-room"
      },
      "date": "2026-01-21",
      "startTime": "14:00",
      "endTime": "16:00",
      "numberOfPeople": 4,
      "totalPrice": 30.00,
      "status": "confirmed",
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

## 📝 Types TypeScript

```typescript
// types/dashboard.ts

export interface BookingData {
  _id: string;
  spaceId: {
    _id: string;
    name: string;
    type: string;
  };
  date: string;               // YYYY-MM-DD
  startTime: string;          // HH:mm
  endTime: string;            // HH:mm
  numberOfPeople: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalBookings: number;
  thisMonthBookings: number;
  totalSpent: number;
  nextBooking: BookingData | null;
}
```

## 🚀 Utilisation

### Importer les Composants

```typescript
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
```

### Exemple Page Custom

```typescript
// app/dashboard/custom/page.tsx
import { getServerSession } from 'next-auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function CustomPage() {
  const session = await getServerSession();

  return (
    <div className="dashboard__overview">
      <h1>Ma Page Custom</h1>
      {/* Contenu */}
    </div>
  );
}
```

## 🎨 Personnalisation

### Couleurs

Modifier les variables SCSS dans `_dashboard.scss`:

```scss
$primary: #007bff;
$success: #28a745;
$warning: #ffc107;
$info: #17a2b8;
```

### Largeur Sidebar

```scss
$sidebar-width: 280px; // Modifier ici
```

### Breakpoint Mobile

```scss
$mobile-breakpoint: 768px; // Modifier ici
```

## ⚡ Performance

### Server-Side Rendering
Toutes les pages dashboard utilisent Server Components pour:
- Fetch direct des données
- SEO optimisé (bien que noindex)
- Pas de flash de contenu

### Cache
```typescript
fetch(url, {
  cache: 'no-store' // Éviter cache pour données user
})
```

## 🐛 Troubleshooting

### Session undefined
Vérifier que NextAuth est bien configuré:
```typescript
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '@/lib/auth';
```

### Redirection infinie
Vérifier le rôle de l'utilisateur:
```typescript
session.user.role.slug === 'client'
```

### Styles non appliqués
Vérifier l'import dans `main.scss`:
```scss
@import 'pages/dashboard';
```

---

**Créé**: 2026-01-21
**Dernière mise à jour**: 2026-01-21
