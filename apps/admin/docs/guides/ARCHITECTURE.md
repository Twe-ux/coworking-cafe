# Architecture & Structure

Guide de l'architecture de l'app admin.

## 📂 Structure des Dossiers

```
/apps/admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Layout dashboard
│   │   │   ├── (admin)/        # Routes admin/dev
│   │   │   │   ├── hr/         # Ressources Humaines
│   │   │   │   └── accounting/ # Comptabilité
│   │   │   └── (staff)/        # Routes staff
│   │   ├── (errors)/           # Pages d'erreur (404, 403, 401, 500)
│   │   ├── api/                # API Routes
│   │   │   ├── hr/             # APIs HR
│   │   │   ├── accounting/     # APIs Comptabilité
│   │   │   └── auth/           # NextAuth
│   │   └── login/              # Page de connexion
│   ├── components/             # Composants React
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Sidebar, Nav
│   │   ├── hr/                 # Composants HR
│   │   ├── clocking/           # Pointage
│   │   ├── schedule/           # Planning
│   │   └── pdf/                # Génération PDF
│   ├── lib/                    # Utilitaires
│   │   ├── api/                # Helpers API (auth, response)
│   │   ├── pdf/                # PDF generation
│   │   └── utils/              # Utilitaires généraux
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # Types TypeScript partagés
│   │   ├── hr.ts               # Types RH (Employee, Shift, etc.)
│   │   ├── timeEntry.ts        # Types pointage
│   │   └── accounting.ts       # Types comptabilité
│   └── models/                 # Mongoose models
│       ├── employee/           # Model Employee (modular)
│       ├── timeEntry/          # Model TimeEntry
│       ├── shift/              # Model Shift
│       └── cashEntry/          # Model CashEntry
├── docs/                       # Documentation
└── CLAUDE.md                   # Guide principal
```

## 🗂️ Organisation des Models (Pattern Modulaire)

**Chaque model suit cette structure** :

```
/models/employee/
├── index.ts        # Export principal, initialisation
├── document.ts     # Interface + Schema Mongoose
├── methods.ts      # Méthodes d'instance (.getFullName(), etc.)
├── hooks.ts        # Pre/post hooks (pre save, etc.)
└── virtuals.ts     # Propriétés virtuelles (.fullName, etc.)
```

### Pourquoi cette structure ?

- ✅ Fichiers < 200 lignes chacun
- ✅ Séparation des responsabilités
- ✅ Facile à maintenir et tester
- ✅ Réutilisable dans plusieurs apps

### Exemple : Model Employee

```typescript
// models/employee/index.ts
import mongoose from 'mongoose'
import { EmployeeSchema } from './document'

export const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema)

// models/employee/document.ts
import { Schema } from 'mongoose'
import type { Employee } from '@/types/hr'

export interface EmployeeDocument extends Document, Employee {
  createdAt: Date
  updatedAt: Date
}

export const EmployeeSchema = new Schema<EmployeeDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  // ... autres champs
}, {
  timestamps: true
})

// models/employee/methods.ts
EmployeeSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`
}

// models/employee/virtuals.ts
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})
```

## 📁 Où Placer les Fichiers ?

### Composants

| Type | Dossier | Exemple |
|------|---------|---------|
| UI génériques | `/components/ui/` | Button, Card, Dialog |
| Layout | `/components/layout/` | Header, Sidebar |
| Métier HR | `/components/hr/` | EmployeeCard, ShiftCalendar |
| Pointage | `/components/clocking/` | ClockInButton |
| Planning | `/components/schedule/` | WeeklyCalendar |
| PDF | `/components/pdf/` | CashControlPDF |

### Hooks

| Type | Dossier | Exemple |
|------|---------|---------|
| Custom hooks | `/hooks/` | useEmployees.ts, useClocking.ts |

### Types

| Type | Dossier | Exemple |
|------|---------|---------|
| Types partagés | `/types/` | hr.ts, timeEntry.ts, accounting.ts |

### Utilitaires

| Type | Dossier | Exemple |
|------|---------|---------|
| API helpers | `/lib/api/` | auth.ts, response.ts |
| PDF utils | `/lib/pdf/` | generatePDF.ts |
| Utilitaires | `/lib/utils/` | cn.ts, format-date.ts |

### API Routes

| Module | Dossier | Exemple |
|--------|---------|---------|
| HR | `/app/api/hr/` | employees, shifts |
| Pointage | `/app/api/time-entries/` | clock-in, clock-out |
| Compta | `/app/api/accounting/` | cash-control, turnover |
| Auth | `/app/api/auth/` | [...nextauth] |

### Pages

| Type | Dossier | Exemple |
|------|---------|---------|
| Admin | `/app/(dashboard)/(admin)/` | hr, accounting |
| Staff | `/app/(dashboard)/(staff)/` | clocking |
| Erreurs | `/app/(errors)/` | 404, 403, 401, 500 |

## 🔄 Flux de Données

```
┌─────────────┐
│   Page      │ (Server Component)
│             │ - Auth check
│             │ - Fetch initial data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Client     │ (Client Component)
│  Component  │ - useState, useEffect
│             │ - Appelle hooks custom
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Custom Hook │ (useEmployees, etc.)
│             │ - Logique métier
│             │ - Appelle API
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Route  │ (route.ts)
│             │ - Auth (requireAuth)
│             │ - Validation
│             │ - Appelle Model
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Model     │ (Mongoose)
│             │ - Schema
│             │ - Méthodes
│             │ - Hooks DB
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  MongoDB    │
└─────────────┘
```

## 📦 Dépendances Principales

### Next.js

- **App Router** : Routing basé sur fichiers
- **Server Components** : Par défaut
- **Client Components** : `"use client"` quand nécessaire

### UI

- **Tailwind CSS** : Styling utilitaire
- **shadcn/ui** : Composants UI
- **lucide-react** : Icônes

### Database

- **MongoDB** : Base de données
- **Mongoose** : ODM (Object Document Mapper)

### Auth

- **NextAuth.js** : Authentification
- **Rôles** : dev, admin, staff

### PDF

- **jsPDF** : Génération PDF
- **jsPDF-AutoTable** : Tableaux PDF

## 🎯 Checklist Ajout de Module

Quand tu ajoutes un nouveau module :

- [ ] Créer le dossier `/app/(dashboard)/(admin)/[module]/`
- [ ] Créer les types dans `/types/[module].ts`
- [ ] Créer le model dans `/models/[module]/` (structure modulaire)
- [ ] Créer les APIs dans `/app/api/[module]/`
- [ ] Créer les composants dans `/components/[module]/`
- [ ] Créer les hooks dans `/hooks/use[Module].ts`
- [ ] Ajouter dans la sidebar (`/components/layout/app-sidebar.tsx`)
- [ ] Documenter dans `/docs/` si patterns spécifiques

---

**Voir aussi** :
- [CONVENTIONS.md](./CONVENTIONS.md) - Règles de code
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration depuis site
