# ADMIN_ARCHITECTURE.md - Dashboard Admin CoworKing Café

**Date**: 2026-01-14
**Version**: 1.0.0
**Objectif**: Architecture complète du dashboard administrateur (apps/admin)

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Rôles et permissions](#rôles-et-permissions)
3. [Architecture des dossiers](#architecture-des-dossiers)
4. [Navigation par rôle](#navigation-par-rôle)
5. [Stack technique](#stack-technique)
6. [Modèles de données](#modèles-de-données)
7. [State Management](#state-management)
8. [Sécurité et authentification](#sécurité-et-authentification)
9. [Plan de migration](#plan-de-migration)
10. [PWA Features](#pwa-features)

---

## 🎯 Vue d'ensemble

### Objectif
Dashboard administrateur unifié pour la gestion complète du CoworKing Café, avec gestion par rôles (RBAC).

### Séparation des responsabilités

| App | Cible | Rôles | Tech Stack |
|-----|-------|-------|------------|
| **apps/site** | Site public + Dashboard client | client | Next.js 14 + Bootstrap + SCSS |
| **apps/admin** | Dashboard administration | dev / admin / staff | Next.js 14 + Tailwind + shadcn/ui + PWA |

### Principes architecturaux
- ✅ RBAC (Role-Based Access Control)
- ✅ Server Components par défaut
- ✅ Protection middleware NextAuth
- ✅ Context API pour state global
- ✅ Composants shadcn/ui réutilisables
- ✅ PWA pour usage mobile
- ✅ Code propre < 200 lignes par fichier

---

## 👥 Rôles et permissions

### Hiérarchie des rôles

```
dev (level: 100)
├── Accès total système
├── Debug tools
├── Analytics avancées
└── Role switcher actif

admin (level: 80)
├── Gestion complète du café
├── Accounting
├── Users management
├── Bookings management
├── Spaces management
├── Products management
├── Blog management
└── Analytics

staff (level: 50)
├── Planning personnel
├── Tâches assignées
├── Calendrier
└── Messages
```

### Matrice de permissions

| Section | Route | dev | admin | staff |
|---------|-------|-----|-------|-------|
| **Dashboard Home** | `/` | ✅ | ✅ | ✅ |
| **Accounting** | `/accounting/*` | ✅ | ✅ | ❌ |
| **Users** | `/users/*` | ✅ | ✅ | ❌ |
| **Bookings** | `/bookings/*` | ✅ | ✅ | 👁️ (read-only) |
| **Spaces** | `/spaces/*` | ✅ | ✅ | ❌ |
| **Products** | `/products/*` | ✅ | ✅ | ❌ |
| **Blog** | `/blog/*` | ✅ | ✅ | ❌ |
| **Analytics** | `/analytics/*` | ✅ | ✅ | ❌ |
| **Schedule** | `/schedule/*` | ✅ | ✅ | ✅ (own only) |
| **Dev Tools** | `/dev/*` | ✅ | ❌ | ❌ |
| **Messages** | `/messages` | ✅ | ✅ | ✅ |
| **Profile** | `/profile` | ✅ | ✅ | ✅ |
| **Notifications** | `/notifications` | ✅ | ✅ | ✅ |

---

## 📁 Architecture des dossiers

### Structure cible

```
apps/admin/
├── public/
│   ├── icons/ (PWA icons)
│   ├── manifest.json
│   └── sw.js (service worker)
├── scripts/
│   ├── create-admin.ts
│   ├── debug-db.ts
│   └── seed-roles.ts (nouveau)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx (sidebar + providers)
│   │   │   ├── page.tsx (home dynamique)
│   │   │   ├── accounting/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── cash-control/
│   │   │   │   └── turnovers/
│   │   │   ├── users/
│   │   │   │   ├── page.tsx (liste)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx (détail)
│   │   │   │   └── create/
│   │   │   │       └── page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx (liste)
│   │   │   │   ├── calendar/
│   │   │   │   └── [id]/
│   │   │   ├── spaces/
│   │   │   │   ├── page.tsx (liste)
│   │   │   │   ├── manage/
│   │   │   │   └── [id]/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx (liste)
│   │   │   │   ├── categories/
│   │   │   │   ├── [id]/
│   │   │   │   └── create/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── articles/
│   │   │   │   ├── categories/
│   │   │   │   └── comments/
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── dev/ (dev only)
│   │   │   │   ├── logs/
│   │   │   │   ├── debug/
│   │   │   │   └── database/
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── accounting/
│   │   │   ├── users/
│   │   │   ├── bookings/
│   │   │   ├── spaces/
│   │   │   ├── products/
│   │   │   └── blog/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx (root)
│   ├── components/
│   │   ├── ui/ (shadcn/ui)
│   │   │   ├── sidebar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   ├── app-sidebar.tsx
│   │   ├── section-cards.tsx
│   │   ├── providers.tsx
│   │   ├── role-switcher.tsx
│   │   └── nav-user.tsx
│   ├── contexts/
│   │   ├── role-switcher-context.tsx
│   │   ├── messaging-context.tsx
│   │   ├── notifications-context.tsx
│   │   └── team-context.tsx
│   ├── hooks/
│   │   ├── useRole.ts
│   │   ├── usePermissions.ts
│   │   ├── useMessaging.ts
│   │   └── useNotifications.ts
│   ├── lib/
│   │   ├── auth.ts (NextAuth config)
│   │   ├── db.ts (MongoDB connection)
│   │   └── utils.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── spaces.ts
│   │   └── user.ts
│   └── middleware.ts (protection routes)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Dossiers à migrer depuis tmp/

```
tmp/app/dashboard/admin/ → src/app/(dashboard)/
tmp/components/ → src/components/ (à adapter shadcn/ui)
tmp/contexts/ → src/contexts/
tmp/hooks/ → src/hooks/
tmp/types/ → src/types/
tmp/lib/ → src/lib/
```

---

## 🧭 Navigation par rôle

### Sidebar - DEV

```tsx
{
  label: "Dashboard",
  items: [
    { title: "Accueil", url: "/", icon: Home },
    { title: "Analytics", url: "/analytics", icon: BarChart }
  ]
},
{
  label: "Gestion",
  items: [
    { title: "Comptabilité", url: "/accounting", icon: Calculator },
    { title: "Utilisateurs", url: "/users", icon: Users },
    { title: "Réservations", url: "/bookings", icon: Calendar },
    { title: "Espaces", url: "/spaces", icon: Warehouse },
    { title: "Produits", url: "/products", icon: Package },
    { title: "Blog", url: "/blog", icon: FileText }
  ]
},
{
  label: "Planning",
  items: [
    { title: "Horaires", url: "/schedule", icon: Clock }
  ]
},
{
  label: "Communication",
  items: [
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Notifications", url: "/notifications", icon: Bell }
  ]
},
{
  label: "Dev Tools",
  items: [
    { title: "Logs", url: "/dev/logs", icon: Terminal },
    { title: "Debug", url: "/dev/debug", icon: Bug },
    { title: "Database", url: "/dev/database", icon: Database }
  ]
}
```

### Sidebar - ADMIN

```tsx
{
  label: "Dashboard",
  items: [
    { title: "Accueil", url: "/", icon: Home },
    { title: "Analytics", url: "/analytics", icon: BarChart }
  ]
},
{
  label: "Gestion",
  items: [
    { title: "Comptabilité", url: "/accounting", icon: Calculator },
    { title: "Utilisateurs", url: "/users", icon: Users },
    { title: "Réservations", url: "/bookings", icon: Calendar },
    { title: "Espaces", url: "/spaces", icon: Warehouse },
    { title: "Produits", url: "/products", icon: Package },
    { title: "Blog", url: "/blog", icon: FileText }
  ]
},
{
  label: "Planning",
  items: [
    { title: "Horaires", url: "/schedule", icon: Clock }
  ]
},
{
  label: "Communication",
  items: [
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Notifications", url: "/notifications", icon: Bell }
  ]
}
```

### Sidebar - STAFF

```tsx
{
  label: "Dashboard",
  items: [
    { title: "Accueil", url: "/", icon: Home }
  ]
},
{
  label: "Mon Planning",
  items: [
    { title: "Horaires", url: "/schedule", icon: Clock },
    { title: "Calendrier", url: "/schedule/calendar", icon: Calendar }
  ]
},
{
  label: "Réservations",
  items: [
    { title: "Voir les réservations", url: "/bookings", icon: Eye }
  ]
},
{
  label: "Communication",
  items: [
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Notifications", url: "/notifications", icon: Bell }
  ]
}
```

---

## 🛠️ Stack technique

### Frontend
```yaml
Framework: Next.js 14.2.17 (App Router)
UI: Tailwind CSS 3.4 + shadcn/ui
Animations: Framer Motion 12.26
Icons: Lucide React 0.468
Forms: React Hook Form + Zod validation
Tables: TanStack Table 8.21
```

### Backend
```yaml
Auth: NextAuth.js 4.24
Database: MongoDB + Mongoose 8.0
Models: Shared from apps/site/src/models/
API: Next.js API Routes
```

### State Management
```yaml
Global: React Context API
Server: React Server Components
Client: useState + useReducer
```

### PWA
```yaml
Service Worker: Workbox
Manifest: /public/manifest.json
Offline: Cache-first strategy
Notifications: Push API
```

### Dev Tools
```yaml
TypeScript: 5.9.3
Linting: ESLint + Next.js config
Formatting: (à définir)
Testing: (à définir)
```

---

## 📊 Modèles de données

### User Model (référence: apps/site/src/models/user/)

```typescript
interface UserDocument {
  email: string
  password: string
  username?: string
  givenName?: string
  phone?: string
  companyName?: string
  role: ObjectId // ref: "Role"
  emailVerifiedAt?: Date
  lastLoginAt?: Date
  passwordChangedAt?: Date
  newsletter: boolean
  isTemporary: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### Role Model (référence: apps/site/src/models/role/)

**⚠️ À MODIFIER** : Passer de 5 rôles à 3 rôles

```typescript
// ❌ ANCIEN
slug: "dev" | "admin" | "manager" | "staff" | "client"

// ✅ NOUVEAU
slug: "dev" | "admin" | "staff"
```

```typescript
interface RoleDocument {
  name: string
  slug: "dev" | "admin" | "staff" // MODIFIÉ
  description?: string
  level: number // dev=100, admin=80, staff=50
  permissions: ObjectId[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Autres modèles (déjà existants)
- Reservation (apps/site/src/models/reservation/)
- Space (apps/site/src/models/space/)
- Article (apps/site/src/models/article/)
- Comment (apps/site/src/models/comment/)
- Payment (apps/site/src/models/payment/)
- Employee (apps/site/src/models/employee/)
- Shift (apps/site/src/models/shift/)
- TimeEntry (apps/site/src/models/timeEntry/)

---

## 🔄 State Management

### Stratégie Context API

#### 1. RoleSwitcherContext (déjà en place)
```typescript
// apps/admin/src/contexts/role-switcher-context.tsx
interface Role {
  name: string
  logo: React.ElementType
  label: string
  value: 'dev' | 'admin' | 'staff'
  description: string
}

// Usage
const { selectedRole, setSelectedRole, canSwitchRole } = useRoleSwitcher()
```

#### 2. MessagingContext (à migrer depuis tmp/)
```typescript
// apps/admin/src/contexts/messaging-context.tsx
interface MessagingContextType {
  conversations: Conversation[]
  messages: Message[]
  sendMessage: (content: string, conversationId: string) => void
  isConnected: boolean
}
```

#### 3. NotificationsContext (à migrer depuis tmp/)
```typescript
// apps/admin/src/contexts/notifications-context.tsx
interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}
```

#### 4. TeamContext (à migrer depuis tmp/)
```typescript
// apps/admin/src/contexts/team-context.tsx
interface TeamContextType {
  team: TeamMember[]
  activeTeam: Team
  switchTeam: (teamId: string) => void
}
```

### Hooks réutilisables

```typescript
// apps/admin/src/hooks/useRole.ts
export function useRole() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as 'dev' | 'admin' | 'staff'

  return {
    role: userRole,
    isDev: userRole === 'dev',
    isAdmin: userRole === 'admin',
    isStaff: userRole === 'staff',
    canAccess: (requiredRole: string) => checkPermission(userRole, requiredRole)
  }
}

// apps/admin/src/hooks/usePermissions.ts
export function usePermissions() {
  const { role } = useRole()

  return {
    canManageUsers: ['dev', 'admin'].includes(role),
    canManageAccounting: ['dev', 'admin'].includes(role),
    canViewBookings: ['dev', 'admin', 'staff'].includes(role),
    canEditBookings: ['dev', 'admin'].includes(role),
    // etc.
  }
}
```

---

## 🔒 Sécurité et authentification

### NextAuth Configuration

```typescript
// apps/admin/src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        const user = await User.findOne({ email: credentials.email })
          .populate('role')
          .select('+password')

        if (!user) throw new Error("Invalid credentials")

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error("Invalid credentials")

        // Vérifier que le rôle est admin/dev/staff
        if (!['dev', 'admin', 'staff'].includes(user.role.slug)) {
          throw new Error("Access denied")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          givenName: user.givenName,
          role: user.role.slug
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}
```

### Middleware Protection

```typescript
// apps/admin/src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Seuls dev/admin/staff peuvent accéder
      if (token?.role && ['dev', 'admin', 'staff'].includes(token.role as string)) {
        return true
      }
      return false
    }
  }
})

export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'
  ]
}
```

### Protection par rôle dans les pages

```typescript
// Composant helper
// apps/admin/src/components/RoleGuard.tsx
export function RoleGuard({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles: ('dev' | 'admin' | 'staff')[]
}) {
  const { role } = useRole()

  if (!allowedRoles.includes(role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

// Usage dans une page
export default function AccountingPage() {
  return (
    <RoleGuard allowedRoles={['dev', 'admin']}>
      <AccountingContent />
    </RoleGuard>
  )
}
```

---

## 📋 Plan de migration

### Phase 0 : Préparation ✅
- [x] Analyser les 2 dashboards existants
- [x] Définir l'architecture cible
- [x] Créer ADMIN_ARCHITECTURE.md

### Phase 1 : Core Foundation (EN COURS)
- [ ] 1.1 Modifier le model Role (dev/admin/staff)
- [ ] 1.2 Script seed-roles.ts pour créer les 3 rôles
- [ ] 1.3 Middleware de protection par rôle
- [ ] 1.4 Layout dashboard avec navigation dynamique
- [ ] 1.5 Page home avec contenu selon rôle
- [ ] 1.6 Migrer contexts (messaging, notifications, team)
- [ ] 1.7 Créer hooks réutilisables (useRole, usePermissions)

### Phase 2 : Sections Admin - Accounting
- [ ] 2.1 Migrer page accounting principale
- [ ] 2.2 Migrer cash-control (déjà commencé)
- [ ] 2.3 Migrer turnovers
- [ ] 2.4 API routes accounting
- [ ] 2.5 Tests et validation

### Phase 3 : Sections Admin - Users
- [ ] 3.1 Liste des utilisateurs (avec filtres)
- [ ] 3.2 Détail utilisateur
- [ ] 3.3 Création/édition utilisateur
- [ ] 3.4 Gestion des rôles
- [ ] 3.5 API routes users

### Phase 4 : Sections Admin - Bookings
- [ ] 4.1 Liste des réservations
- [ ] 4.2 Calendrier des réservations
- [ ] 4.3 Détail réservation
- [ ] 4.4 Création/édition réservation
- [ ] 4.5 API routes bookings

### Phase 5 : Sections Admin - Spaces
- [ ] 5.1 Liste des espaces
- [ ] 5.2 Gestion des espaces
- [ ] 5.3 Configuration des espaces
- [ ] 5.4 API routes spaces

### Phase 6 : Sections Admin - Products
- [ ] 6.1 Liste des produits
- [ ] 6.2 Catégories de produits
- [ ] 6.3 Création/édition produits
- [ ] 6.4 API routes products

### Phase 7 : Sections Admin - Blog
- [ ] 7.1 Liste des articles
- [ ] 7.2 Création/édition articles
- [ ] 7.3 Gestion des catégories
- [ ] 7.4 Gestion des commentaires
- [ ] 7.5 API routes blog

### Phase 8 : Sections Admin - Analytics
- [ ] 8.1 Dashboard analytics
- [ ] 8.2 Graphiques revenus
- [ ] 8.3 Graphiques réservations
- [ ] 8.4 Statistiques utilisateurs
- [ ] 8.5 Export de données

### Phase 9 : Sections Staff
- [ ] 9.1 Planning personnel
- [ ] 9.2 Calendrier
- [ ] 9.3 Tâches assignées
- [ ] 9.4 API routes schedule

### Phase 10 : Sections Shared
- [ ] 10.1 Messages (chat)
- [ ] 10.2 Profil utilisateur
- [ ] 10.3 Notifications
- [ ] 10.4 API routes messages

### Phase 11 : Dev Tools
- [ ] 11.1 Logs system
- [ ] 11.2 Debug tools
- [ ] 11.3 Database browser
- [ ] 11.4 API routes dev

### Phase 12 : PWA Features
- [ ] 12.1 Service worker
- [ ] 12.2 Manifest.json
- [ ] 12.3 Offline mode
- [ ] 12.4 Push notifications
- [ ] 12.5 Install prompt

### Phase 13 : Tests & Optimisation
- [ ] 13.1 Tests unitaires
- [ ] 13.2 Tests E2E
- [ ] 13.3 Performance optimization
- [ ] 13.4 Accessibilité
- [ ] 13.5 SEO

### Phase 14 : Documentation & Déploiement
- [ ] 14.1 Documentation technique
- [ ] 14.2 Guide utilisateur
- [ ] 14.3 Setup CI/CD
- [ ] 14.4 Déploiement Northflank

---

## 📱 PWA Features

### Manifest Configuration

```json
// apps/admin/public/manifest.json
{
  "name": "CoworKing Café Admin",
  "short_name": "CWK Admin",
  "description": "Dashboard administrateur pour CoworKing Café",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#417972",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker Strategy

```typescript
// apps/admin/public/sw.js
// Cache-first strategy pour les assets statiques
// Network-first pour les API calls
// Offline fallback page
```

### Next.js PWA Configuration

```javascript
// apps/admin/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // next config
})
```

---

## 📝 Conventions de code

### Nommage
```typescript
// Composants: PascalCase
export function UserList() {}

// Hooks: camelCase avec préfixe use
export function useRole() {}

// Types/Interfaces: PascalCase
interface UserDocument {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = '/api'

// Fonctions: camelCase
function fetchUsers() {}
```

### Structure des fichiers
```typescript
// ============================================
// IMPORTS
// ============================================
import { ... } from 'react'
import { ... } from 'next'
import { ... } from '@/components'

// ============================================
// TYPES
// ============================================
interface Props {}

// ============================================
// CONSTANTS
// ============================================
const DATA = []

// ============================================
// COMPOSANTS LOCAUX
// ============================================
function SubComponent() {}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MainComponent() {}
```

### Limites strictes
- Fichiers: < 200 lignes
- Fonctions: < 50 lignes
- Composants: < 150 lignes
- Pas de `any` en TypeScript
- Toujours typer les props et retours de fonctions

---

## 🚀 Commandes

```bash
# Développement
pnpm --filter @coworking-cafe/admin dev       # Port 3001
pnpm --filter @coworking-cafe/admin build
pnpm --filter @coworking-cafe/admin start

# Scripts utilitaires
pnpm --filter @coworking-cafe/admin create-admin
pnpm --filter @coworking-cafe/admin debug-db
pnpm --filter @coworking-cafe/admin seed-roles  # À créer

# Tests
pnpm --filter @coworking-cafe/admin test
pnpm --filter @coworking-cafe/admin test:e2e

# Linting
pnpm --filter @coworking-cafe/admin lint
pnpm --filter @coworking-cafe/admin type-check
```

---

## 🔗 Références

### Documentation interne
- `/Users/twe/Developer/Thierry/coworking-cafe/CLAUDE.md` - Instructions projet
- `/Users/twe/Developer/Thierry/coworking-cafe/docs/CONVENTIONS.md` - Conventions code
- `/Users/twe/Developer/Thierry/coworking-cafe/docs/REFACTO_TEMPLATE.md` - Template refacto

### Repos
- **Nouveau monorepo**: `/Users/twe/Developer/Thierry/coworking-cafe/`
- **Projet original**: `/Users/twe/Developer/Thierry/bt-coworkingcafe/` (référence uniquement)

### Stack externe
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Mongoose](https://mongoosejs.com/docs/)
- [Framer Motion](https://www.framer.com/motion/)

---

## ✅ Checklist avant déploiement

### Sécurité
- [ ] Toutes les routes protégées par middleware
- [ ] Validation des inputs côté serveur
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting sur les API
- [ ] CSRF protection
- [ ] XSS protection

### Performance
- [ ] Images optimisées (Next/Image)
- [ ] Code splitting
- [ ] Lazy loading composants
- [ ] Service worker configuré
- [ ] Cache strategy définie

### Accessibilité
- [ ] Navigation au clavier
- [ ] ARIA labels
- [ ] Contraste couleurs (WCAG AA)
- [ ] Focus visible
- [ ] Screen reader compatible

### Tests
- [ ] Tests unitaires > 80% coverage
- [ ] Tests E2E sur parcours critiques
- [ ] Tests de charge
- [ ] Tests responsive (mobile/tablet/desktop)

### Documentation
- [ ] README à jour
- [ ] Variables d'env documentées
- [ ] API routes documentées
- [ ] Guide de déploiement
- [ ] Changelog

---

**Document créé le**: 2026-01-14
**Dernière mise à jour**: 2026-01-14
**Auteur**: Claude (Opus 4.1)
**Statut**: Phase 1 en cours
