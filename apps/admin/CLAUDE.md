# CLAUDE.md - Admin App Development Guide

> **App** : `/apps/admin/` - Dashboard Admin du Coworking Café
> **Date de création** : 2026-01-16
> **Version** : 1.0
> **Status** : ✅ Production Ready (après refactoring complet)

---

## 📋 Vue d'ensemble

Cette app Next.js 14 (App Router) est le **dashboard admin** pour gérer :
- 👥 Ressources Humaines (employés, contrats, onboarding)
- ⏰ Pointage et planning des équipes
- 💰 Comptabilité (caisse, chiffre d'affaires)
- 📊 Statistiques et analytics

**Stack technique** :
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components
- MongoDB + Mongoose
- NextAuth.js

---

## 🎯 Contexte Important

### Historique du Refactoring (Janvier 2026)

L'app a été **entièrement refactorisée** avec :
- ✅ Sécurité : 100% des routes protégées
- ✅ Types : 0 `any` types, interfaces partagées
- ✅ Architecture : APIs consolidées, utilitaires créés
- ✅ Code : Fichiers < 200 lignes, composants modulaires

**Documentation complète** : `/apps/admin/docs/REFACTORING_SUMMARY.md`

### Prochaine Étape : Migration depuis `/apps/site/`

Nous allons **migrer progressivement** des modules depuis `/apps/site/src/app/dashboard/` :
- 📅 Booking (réservations, calendrier)
- 💬 Messages (chat, notifications)
- ⚙️ Settings (espaces, horaires)
- 📊 Analytics avancées

**⚠️ IMPORTANT** : Ce CLAUDE.md définit les règles pour que ces migrations se fassent **proprement**, sans tout refactoriser à chaque fois.

---

## 🏗️ Architecture & Structure

### Structure des Dossiers

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
│   └── REFACTORING_SUMMARY.md  # Historique du refactoring
├── TESTING_CHECKLIST.md        # Checklist de tests
└── CLAUDE.md                   # Ce fichier !
```

### Organisation des Models (Pattern Mongoose)

**Chaque model suit cette structure modulaire** :

```
/models/employee/
├── index.ts        # Export principal, initialisation
├── document.ts     # Interface + Schema Mongoose
├── methods.ts      # Méthodes d'instance (.getFullName(), etc.)
├── hooks.ts        # Pre/post hooks (pre save, etc.)
└── virtuals.ts     # Propriétés virtuelles (.fullName, etc.)
```

**Pourquoi ?**
- Fichiers < 200 lignes chacun
- Séparation des responsabilités
- Facile à maintenir et tester
- Réutilisable dans plusieurs apps

---

## ✅ Conventions de Code (STRICTES)

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) {
  // ...
}

// ✅ CORRECT
interface EmployeeData {
  id: string
  firstName: string
  lastName: string
}

function handleData(data: EmployeeData) {
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
  clockIn: new Date("2026-01-16T09:00:00.000Z") // ❌
}

// ✅ CORRECT - Strings simples
{
  date: "2026-01-16",    // Format YYYY-MM-DD
  clockIn: "09:00",      // Format HH:mm
  clockOut: "17:30"      // Format HH:mm
}
```

**Types à utiliser** :

```typescript
// /types/timeEntry.ts
interface TimeEntry {
  id: string
  employeeId: string
  date: string        // YYYY-MM-DD
  clockIn: string     // HH:mm
  clockOut?: string   // HH:mm | null
  shiftNumber: 1 | 2
  status: 'active' | 'completed'
}
```

**Transformation Date ↔ String** :

```typescript
// Si besoin de manipuler comme Date (côté client)
type TimeEntryWithDates = Omit<TimeEntry, 'date' | 'clockIn' | 'clockOut'> & {
  date: Date
  clockIn: Date
  clockOut?: Date | null
}

// Transformer API string → Date (pour manipulation)
function toDateObject(entry: TimeEntry): TimeEntryWithDates {
  return {
    ...entry,
    date: new Date(entry.date),
    clockIn: new Date(`${entry.date}T${entry.clockIn}`),
    clockOut: entry.clockOut ? new Date(`${entry.date}T${entry.clockOut}`) : null,
  }
}
```

### 3. Taille des Fichiers

| Type de fichier | Max lignes | Action si dépassé |
|-----------------|------------|-------------------|
| **Composants React** | 200 | Extraire sous-composants ou hooks |
| **Custom Hooks** | 150 | Séparer en hooks spécialisés |
| **Pages Next.js** | 150 | Logique → hooks, UI → composants |
| **API Routes** | 200 | Extraire validation/logique en utils |
| **Models Mongoose** | 150 | Utiliser structure modulaire (5 fichiers) |
| **Utils/Helpers** | 200 | Découper par responsabilité |

**Comment découper un gros composant :**

```typescript
// ❌ MAUVAIS - Tout dans un fichier (300 lignes)
export function EmployeeList() {
  // 50 lignes de logique
  // 50 lignes de state
  // 100 lignes de handlers
  // 100 lignes de JSX
}

// ✅ BON - Découpage propre

// hooks/useEmployeeList.ts (80 lignes)
export function useEmployeeList() {
  // Toute la logique ici
  return { employees, loading, error, actions }
}

// components/EmployeeList.tsx (120 lignes)
export function EmployeeList() {
  const { employees, loading, error, actions } = useEmployeeList()

  if (loading) return <EmployeeListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <EmployeeHeader actions={actions} />
      <EmployeeTable employees={employees} />
      <EmployeePagination />
    </div>
  )
}
```

### 4. Nommage

**Fichiers** :
- Composants : `PascalCase.tsx` (EmployeeList.tsx)
- Hooks : `camelCase.ts` (useEmployees.ts)
- Utils : `kebab-case.ts` (format-date.ts)
- Types : `camelCase.ts` (timeEntry.ts)
- API routes : `route.ts` (convention Next.js)

**Variables** :
```typescript
// ❌ INTERDIT - Noms génériques
const data = await fetch(...)
const result = handleStuff()
const temp = employee

// ✅ CORRECT - Noms descriptifs
const employeesData = await fetch(...)
const validationResult = handleValidation()
const activeEmployee = employee
```

**Fonctions** :
```typescript
// ❌ INTERDIT
function process() {}
function handle() {}
function do() {}

// ✅ CORRECT - Verbe + Nom
function processEmployee() {}
function handleSubmit() {}
function validateForm() {}
function fetchEmployees() {}
```

### 5. Composants Réutilisables

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
    <div className={cn(cardVariants[variant], className)}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
```

---

## 🔒 Sécurité & Authentification

### Pattern d'Authentification (API Routes)

**Utiliser TOUJOURS le helper `/lib/api/auth.ts`** :

```typescript
// /app/api/hr/employees/route.ts
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
  // 1. Authentification OBLIGATOIRE
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response // 401 ou 403
  }

  // 2. Logique métier
  try {
    const employees = await Employee.find({ isActive: true })
    return successResponse(employees)
  } catch (error) {
    return errorResponse('Erreur serveur', error.message)
  }
}
```

### Niveaux de Permissions

| Rôle | Accès | Usage |
|------|-------|-------|
| `dev` | Complet (admin + debug) | Développement |
| `admin` | Gestion complète | Admin système |
| `staff` | Lecture HR/Planning | Employé |

**Configuration** :

```typescript
// Lecture seule (tous les rôles)
requireAuth(['dev', 'admin', 'staff'])

// Écriture (admin seulement)
requireAuth(['dev', 'admin'])

// Debug (dev seulement)
requireAuth(['dev'])
```

### Distinction Rôles Système vs Rôles Métier

**⚠️ IMPORTANT** : Ne pas confondre les deux types de rôles :

#### 1. Rôles Système (Authentication NextAuth)
Utilisés pour **l'authentification et les permissions d'accès** à l'application :
- `dev` - Développeur (accès complet)
- `admin` - Administrateur (gestion complète)
- `staff` - Employé (lecture seulement)

**Usage** : `requireAuth(['dev', 'admin', 'staff'])`

#### 2. Rôles Métier RH (employeeRole)
Utilisés pour **la fonction dans l'entreprise** (type d'employé) :
- `Manager` - Responsable d'équipe
- `Assistant manager` - Responsable adjoint
- `Employé polyvalent` - Employé standard

**Usage** : Champ `employeeRole` dans le type `Employee`

**Exemple de confusion à éviter** :
```typescript
// ❌ MAUVAIS - Confondre rôle système et rôle métier
requireAuth(['Manager']) // Manager n'est pas un rôle système

// ✅ BON - Utiliser le bon rôle
requireAuth(['dev', 'admin', 'staff']) // Rôles système
employee.employeeRole === 'Manager' // Rôle métier
```

### Routes Publiques (Exceptions)

Seules ces routes peuvent être **publiques** :
- `/api/auth/[...nextauth]` - NextAuth endpoint
- `/api/hr/employees/verify-pin` - Vérification PIN pour pointage
- `/api/time-entries/clock-in` - Pointage entrée (avec PIN)
- `/api/time-entries/clock-out` - Pointage sortie (avec PIN)

**Toutes les autres routes DOIVENT être protégées !**

---

## 📦 Types Partagés (Single Source of Truth)

### Utiliser les Types Partagés

**RÈGLE** : Toujours importer depuis `/types/` plutôt que redéfinir localement

```typescript
// ❌ INTERDIT - Interface locale
interface Employee {
  id: string
  firstName: string
  lastName: string
}

// ✅ CORRECT - Import depuis types partagés
import type { Employee } from '@/types/hr'
```

### Types Principaux

**`/types/hr.ts`** :
- `Employee` - Employé complet
- `EmployeeFormData` - Formulaire création/édition
- `Shift` - Créneau de travail
- `AvailabilityDay` - Disponibilité par jour
- `WeeklyAvailability` - Disponibilités hebdomadaires

**`/types/timeEntry.ts`** :
- `TimeEntry` - Entrée de pointage
- `TimeEntryFilter` - Filtres pour recherche
- `TimeEntryUpdate` - Données de mise à jour
- `EmployeeTimeReport` - Rapport d'heures
- `ApiResponse<T>` - Format de réponse API standardisé

**`/types/accounting.ts`** :
- `CashEntry` - Entrée de caisse
- `CashEntryRow` - Ligne de caisse (pour tableau)
- `TurnoverData` - Données de CA
- `CashControlPDF` - Données pour PDF

### Créer un Nouveau Type

Si tu dois créer un nouveau type partagé :

```typescript
// 1. Ajouter dans /types/monModule.ts
export interface MonNouveauType {
  id: string
  // ... champs
}

// 2. Exporter dans index (si nécessaire)
// /types/index.ts
export * from './monModule'

// 3. Utiliser partout
import type { MonNouveauType } from '@/types/monModule'
```

---

## 🌐 API Routes (Next.js)

### Structure d'une Route API

```typescript
// /app/api/hr/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Employee } from '@/models/employee'
import type { ApiResponse } from '@/types/timeEntry'

// GET /api/hr/employees
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Employee[]>>> {
  // 1. Auth
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Query params
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  // 4. Logic
  try {
    const filter = status ? { isActive: status === 'active' } : {}
    const employees = await Employee.find(filter).sort({ lastName: 1 })

    return successResponse(employees, 'Employés récupérés avec succès')
  } catch (error) {
    console.error('GET /api/hr/employees error:', error)
    return errorResponse('Erreur lors de la récupération des employés', error.message)
  }
}

// POST /api/hr/employees
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Employee>>> {
  // 1. Auth (écriture = admin/dev seulement)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Parse body
  try {
    const body = await request.json()

    // 4. Validation
    if (!body.firstName || !body.lastName || !body.email) {
      return errorResponse('Données manquantes', 'firstName, lastName, email sont requis', 400)
    }

    // 5. Business logic
    const employee = await Employee.create(body)

    return successResponse(employee, 'Employé créé avec succès', 201)
  } catch (error) {
    console.error('POST /api/hr/employees error:', error)
    return errorResponse('Erreur lors de la création de l\'employé', error.message)
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
  return errorResponse(
    'Message utilisateur friendly',
    error.message, // Détails techniques
    500 // Status code approprié
  )
}
```

### Status Codes Appropriés

| Code | Usage | Exemple |
|------|-------|---------|
| 200 | GET réussi | Liste d'employés |
| 201 | POST réussi (création) | Nouvel employé créé |
| 204 | DELETE réussi | Employé supprimé |
| 400 | Erreur validation | Champs manquants |
| 401 | Non authentifié | Pas de session |
| 403 | Permission refusée | Role insuffisant |
| 404 | Ressource introuvable | Employé inexistant |
| 500 | Erreur serveur | Erreur DB, etc. |

---

## 🎨 Composants React

### Structure d'un Composant

```typescript
// components/hr/EmployeeCard.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone } from 'lucide-react'
import type { Employee } from '@/types/hr'

/**
 * Card affichant les infos d'un employé
 *
 * @param employee - Employé à afficher
 * @param onEdit - Callback pour éditer
 * @param onDelete - Callback pour supprimer
 */
interface EmployeeCardProps {
  employee: Employee
  onEdit?: (employee: Employee) => void
  onDelete?: (employeeId: string) => void
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {employee.firstName} {employee.lastName}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Mail className="w-4 h-4" />
            <span>{employee.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{employee.phone}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(employee.id)}>
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
```

### Hooks Personnalisés

**Extraire la logique dans des hooks custom** :

```typescript
// hooks/useEmployees.ts
import { useState, useEffect } from 'react'
import type { Employee } from '@/types/hr'

interface UseEmployeesOptions {
  status?: 'active' | 'inactive' | 'all'
}

interface UseEmployeesReturn {
  employees: Employee[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEmployees(options: UseEmployeesOptions = {}): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status && options.status !== 'all') {
        params.set('status', options.status)
      }

      const response = await fetch(`/api/hr/employees?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue')
      }

      setEmployees(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [options.status])

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
  }
}
```

---

## 🚀 Migration depuis `/apps/site/`

### ⚠️ PHILOSOPHIE DE MIGRATION - IMPORTANT

**Ce n'est PAS un copier-coller !**

La migration d'un module de `/apps/site/` vers `/apps/admin/` est une **RÉÉCRITURE COMPLÈTE** avec les bonnes pratiques :

```
❌ MAUVAISE APPROCHE          ✅ BONNE APPROCHE
────────────────────────      ────────────────────────
1. Copier le code             1. ANALYSER le code source
2. Coller dans admin          2. COMPRENDRE la logique métier
3. Ajuster les imports        3. IDENTIFIER les problèmes
                              4. RÉÉCRIRE proprement dans admin
                              5. RESPECTER les conventions strictes
```

**Pourquoi réécrire ?**
- 🎯 Éliminer les `any` types
- 🎯 Découper les fichiers > 200 lignes
- 🎯 Utiliser la structure modulaire (models, types, helpers)
- 🎯 Appliquer les patterns de sécurité (`requireAuth()`)
- 🎯 Normaliser les formats de dates (strings)
- 🎯 Utiliser Tailwind + shadcn/ui au lieu de Bootstrap

**Résultat attendu** : Code propre, maintenable, et conforme aux standards de `/apps/admin/`.

---

### Workflow de Migration d'un Module

Quand tu veux migrer un module de `/apps/site/src/app/dashboard/` vers `/apps/admin/` :

#### 1. **Analyse** (30 min)

```bash
# Liste les fichiers du module
ls -la /apps/site/src/app/dashboard/booking/

# Analyse la structure
# - Quelles pages ?
# - Quels composants ?
# - Quelles APIs ?
# - Quels types ?
# - Quelles dépendances ?
```

**Créer un document d'analyse** :

```markdown
## Module: Booking

### Structure actuelle (/apps/site)
- Pages: calendar, reservations, settings
- Composants: 12 composants
- APIs: /api/bookings (GET, POST, PUT, DELETE)
- Types: booking.ts, reservation.ts
- Hooks: useBookings.ts, useCalendar.ts

### Stack technique
- Framer Motion pour animations
- FullCalendar pour calendrier
- Recharts pour graphiques

### Dépendances
- Employee (déjà dans admin ✓)
- Space (à migrer)
- Tariff (à migrer)
```

#### 2. **Types d'abord** (1h)

```typescript
// 1. Créer /types/booking.ts dans /apps/admin/
export interface Booking {
  id: string
  clientId: string
  spaceId: string
  startDate: string  // YYYY-MM-DD
  endDate: string
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled'
  // ...
}

// 2. Importer et adapter si besoin
import type { Employee } from '@/types/hr'

export interface BookingWithEmployee extends Booking {
  employee: Pick<Employee, 'id' | 'firstName' | 'lastName'>
}
```

#### 3. **Models Mongoose** (1-2h)

```bash
# Créer la structure modulaire
mkdir -p src/models/booking
touch src/models/booking/{index,document,methods,hooks,virtuals}.ts

# Suivre le pattern établi (voir /models/employee/)
```

```typescript
// document.ts
import { Schema } from 'mongoose'
import type { Booking } from '@/types/booking'

export interface BookingDocument extends Document, Booking {
  createdAt: Date
  updatedAt: Date
}

export const BookingSchema = new Schema<BookingDocument>({
  clientId: { type: String, required: true },
  spaceId: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
}, {
  timestamps: true
})
```

#### 4. **API Routes** (2-3h)

```bash
# Créer la structure
mkdir -p src/app/api/booking
touch src/app/api/booking/route.ts
touch src/app/api/booking/[id]/route.ts
```

```typescript
// route.ts - Suivre le pattern établi
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response

  // ... logique
}
```

#### 5. **Composants** (3-4h)

```bash
# Créer la structure
mkdir -p src/components/booking
touch src/components/booking/{BookingCalendar,BookingList,BookingModal,BookingStats}.tsx
```

**Adapter le code** :
- Remplacer `any` par types propres
- Extraire hooks si > 100 lignes
- Utiliser composants shadcn/ui
- Respecter limite 200 lignes/fichier

#### 6. **Hooks** (1h)

```typescript
// hooks/useBookings.ts
export function useBookings(filters?: BookingFilters) {
  // Pattern établi (voir useEmployees.ts)
  return { bookings, loading, error, refetch }
}
```

#### 7. **Pages** (2h)

```bash
# Créer les pages
mkdir -p src/app/(dashboard)/(admin)/booking
touch src/app/(dashboard)/(admin)/booking/page.tsx
touch src/app/(dashboard)/(admin)/booking/calendar/page.tsx
```

#### 8. **Tests** (1h)

- Suivre `TESTING_CHECKLIST.md`
- Ajouter tests spécifiques au module
- Vérifier console (F12)

#### 9. **Documentation** (30min)

```markdown
# Mettre à jour ce CLAUDE.md si besoin
# Ajouter section "Module Booking" si patterns spécifiques
```

### Checklist Migration

- [ ] Analyse complète du module source
- [ ] Types créés dans `/types/`
- [ ] Models Mongoose (structure modulaire)
- [ ] API routes avec auth + response helpers
- [ ] Composants < 200 lignes
- [ ] Hooks custom pour logique
- [ ] Pages Next.js < 150 lignes
- [ ] Zero `any` types
- [ ] Dates/heures en format string
- [ ] Tests manuels (checklist)
- [ ] Pas d'erreurs console
- [ ] Build réussi
- [ ] Documentation mise à jour

**Temps estimé par module** : 1-2 jours

---

## 🧪 Tests

### Tests Manuels (OBLIGATOIRE)

**Avant chaque commit important** :

```bash
# Lire la checklist
open TESTING_CHECKLIST.md

# Lancer le serveur
pnpm dev

# Tester au minimum (5 min) :
# 1. Login
# 2. Navigation dans le nouveau module
# 3. Créer/Modifier/Supprimer un élément
# 4. Vérifier console (F12) - pas d'erreurs
# 5. Vérifier que les données se sauvent en BD
```

### Avant de Push

```bash
# Type check
pnpm exec tsc --noEmit

# Build
pnpm build

# Si succès → OK pour commit
git add .
git commit -m "feat(admin): add booking module"
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

5. **APIs non protégées**
```typescript
// ❌ JAMAIS
export async function GET() {
  return NextResponse.json({ data: await getSensitiveData() })
}

// ✅ TOUJOURS
export async function GET() {
  const auth = await requireAuth(['admin'])
  if (!auth.authorized) return auth.response
  // ...
}
```

6. **Interfaces locales dupliquées**
```typescript
// ❌ JAMAIS
interface Employee { ... } // dans le composant

// ✅ TOUJOURS
import type { Employee } from '@/types/hr'
```

---

## 📚 Ressources & Documentation

### Documentation Interne

- **Refactoring complet** : `/docs/REFACTORING_SUMMARY.md`
- **Tests manuels** : `/TESTING_CHECKLIST.md`
- **Conventions monorepo** : `/CLAUDE.md` (root)
- **Architecture** : `/docs/CONVENTIONS.md` (root)

### Documentation Externe

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Exemples de Code

**Bon exemple de composant** : `/components/hr/availability/AvailabilityCalendarTab.tsx`
- Types importés
- Hooks séparés
- < 200 lignes
- Props typées

**Bon exemple d'API route** : `/app/api/hr/employees/route.ts`
- Auth avec `requireAuth()`
- Réponses avec helpers
- Try/catch systématique
- Types de retour

**Bon exemple de model** : `/models/employee/`
- Structure modulaire (5 fichiers)
- Chaque fichier < 150 lignes
- Types partagés
- Hooks et virtuals séparés

---

## 🎯 Checklist Avant de Coder

Avant de commencer une nouvelle feature :

- [ ] J'ai lu ce CLAUDE.md
- [ ] J'ai analysé le module source (si migration)
- [ ] Je connais les types à utiliser (`/types/`)
- [ ] Je connais les helpers disponibles (`/lib/api/`)
- [ ] Je sais où placer mes fichiers (structure ci-dessus)
- [ ] Je respecterai les limites de lignes
- [ ] Je n'utiliserai pas `any`
- [ ] J'utiliserai des strings pour dates/heures
- [ ] Je protégerai mes APIs avec `requireAuth()`
- [ ] Je testerai manuellement avant de commit

---

## 💡 En Cas de Doute

**Questions fréquentes** :

### "Où mettre ce nouveau fichier ?"
→ Consulte la section "Architecture & Structure"

### "Comment typer cette donnée ?"
→ Regarde dans `/types/`, sinon crée un nouveau type partagé

### "Cette API doit-elle être protégée ?"
→ OUI, sauf si c'est auth/verify-pin/clock-in/clock-out

### "Ce composant fait 300 lignes, c'est grave ?"
→ OUI, découpe-le en sous-composants + hook

### "Je peux utiliser `any` juste pour aller vite ?"
→ NON, prends 2 minutes pour typer correctement

### "Format Date ou string pour les dates ?"
→ **TOUJOURS string** (YYYY-MM-DD, HH:mm)

---

## 🚀 Prochaines Étapes - Modules à Migrer

**Modules prioritaires à migrer depuis `/apps/site/`** :

### 1. 📅 Booking (Réservations + Calendrier)
- **Priorité** : Haute 🔴
- **Estimation** : 2 jours
- **Complexité** : Moyenne
- **Dépendances** :
  - Space (espaces) - à créer
  - Client (utilisateurs) - à créer
  - Stripe (paiements) - déjà intégré
- **Models à créer** :
  - `Booking` (réservation)
  - `Space` (espace coworking)
  - `TimeSlot` (créneaux horaires)

### 2. 💬 Messages (Messagerie Interne)
- **Priorité** : Moyenne 🟡
- **Estimation** : 3 jours
- **Complexité** : Élevée
- **Dépendances** :
  - WebSockets (temps réel)
  - Notifications push
  - Employee (déjà créé ✅)
  - Client (à créer)
- **Models à créer** :
  - `Message` (message)
  - `Conversation` (conversation)
  - `Notification` (notification)

### 3. ⚙️ Settings (Espaces, Horaires, Configuration)
- **Priorité** : Moyenne 🟡
- **Estimation** : 1 jour
- **Complexité** : Faible
- **Dépendances** : Aucune
- **Models à créer** :
  - `Space` (si pas déjà créé avec Booking)
  - `OpeningHours` (horaires d'ouverture)
  - `Config` (configuration générale)

### 4. 📊 Analytics Avancées
- **Priorité** : Basse 🟢
- **Estimation** : 2 jours
- **Complexité** : Moyenne
- **Dépendances** :
  - Recharts (graphiques)
  - APIs stats (déjà existantes)
  - Tous les models existants (pour agréger les données)
- **Models à créer** : Aucun (utilise les models existants)

---

### 📋 Ordre de Migration Recommandé

**Phase 1** : Booking (2 jours)
- Crée les bases : Space, TimeSlot, Booking
- Permet de gérer les réservations depuis admin

**Phase 2** : Settings (1 jour)
- Simplifie la configuration des espaces
- Utilise les models créés en Phase 1

**Phase 3** : Messages (3 jours)
- Plus complexe, nécessite WebSockets
- Peut attendre que les autres modules soient stables

**Phase 4** : Analytics (2 jours)
- En dernier, car utilise tous les autres models
- Tableau de bord complet

**Total estimé** : 8 jours de développement

---

### ✅ Pour Chaque Module Migré

- [ ] Suivre le workflow de migration (section ci-dessus)
- [ ] Respecter TOUTES les conventions strictes
- [ ] RÉÉCRIRE (pas copier-coller)
- [ ] Tester manuellement (`TESTING_CHECKLIST.md`)
- [ ] Build réussi (`pnpm build`)
- [ ] Commit avec message descriptif
- [ ] Mettre à jour ce CLAUDE.md si nouveaux patterns

---

## ✅ Status Actuel de l'App

**Version** : 1.0
**Status** : ✅ Production Ready

### Modules Implémentés

- ✅ **Auth** - NextAuth avec rôles (dev, admin, staff)
- ✅ **HR** - Gestion employés complète (CRUD, onboarding, disponibilités)
- ✅ **Pointage** - Time tracking avec créneaux manuels
- ✅ **Planning** - Calendrier des shifts mensuels
- ✅ **Comptabilité** - Caisse + CA avec PDF
- ✅ **Dashboard** - Stats et navigation
- ✅ **Pages d'erreur** - 404, 403, 401, 500 (design fun)

### Qualité du Code

- ✅ **Sécurité** : 100% des routes protégées
- ✅ **Types** : 0 `any`, types partagés partout
- ✅ **Architecture** : APIs consolidées, utilitaires créés
- ✅ **Tests** : Checklist complète disponible
- ✅ **Documentation** : Complète et à jour
- ✅ **Build** : Réussi (27/27 pages)

### Dette Technique

- ⚠️ 2 warnings Mongoose exports (non-bloquant)
- ⚠️ Utilisation de `requireAuth` à généraliser (en cours)
- 📋 Tests automatisés à créer (E2E avec Playwright)

---

**Dernière mise à jour** : 2026-01-16
**Auteur** : Thierry + Claude (Opus 4.1)
**Version** : 1.0

---

*Ce document est LA référence pour développer dans `/apps/admin/`. Respecte ces conventions et le code restera maintenable ! 🚀*
