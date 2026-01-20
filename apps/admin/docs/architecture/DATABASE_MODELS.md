# Documentation des Modeles Mongoose

> Documentation des modeles de base de donnees de l'application admin.
> **Derniere mise a jour** : 2026-01-20

---

## Structure Modulaire des Modeles

Chaque modele suit une structure en 5 fichiers :

```
/models/employee/
├── index.ts        # Export principal, initialisation
├── document.ts     # Interface + Schema Mongoose
├── methods.ts      # Methodes d'instance
├── hooks.ts        # Pre/post hooks
└── virtuals.ts     # Proprietes virtuelles
```

---

## Modeles Disponibles

### Employee (`/models/employee/`)

Gestion des employes.

```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pin: string;
  color: string;
  employeeRole: 'Manager' | 'Assistant manager' | 'Employe polyvalent';
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Alternance';
  isActive: boolean;
  // ...
}
```

### TimeEntry (`/models/timeEntry/`)

Pointage des heures.

```typescript
interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;      // YYYY-MM-DD
  clockIn: string;   // HH:mm
  clockOut?: string; // HH:mm
  shiftNumber: 1 | 2;
  status: 'active' | 'completed';
}
```

### Shift (`/models/shift/`)

Planning des shifts.

```typescript
interface Shift {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  type: string;
  isActive: boolean;
}
```

### Availability (`/models/availability/`)

Disponibilites des employes.

```typescript
interface Availability {
  id: string;
  employeeId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  isRecurring: boolean;
}
```

### CashEntry (`/models/cashEntry/`)

Entrees de caisse.

```typescript
interface CashEntry {
  _id: string;        // YYYY/MM/DD
  prestaB2B: Array<{ label: string; value: number }>;
  depenses: Array<{ label: string; value: number }>;
  virement: number;
  especes: number;
  cbClassique: number;
  cbSansContact: number;
}
```

### Turnover (`/models/turnover/`)

Chiffre d'affaires journalier.

```typescript
interface Turnover {
  _id: string;  // YYYY/MM/DD
  'vat-20': { 'total-ht': number; 'total-ttc': number; 'total-taxes': number };
  'vat-10': { 'total-ht': number; 'total-ttc': number; 'total-taxes': number };
  'vat-55': { 'total-ht': number; 'total-ttc': number; 'total-taxes': number };
  'vat-0': { 'total-ht': number; 'total-ttc': number; 'total-taxes': number };
}
```

---

## Pattern d'Import des Fichiers

**IMPORTANT** : Toujours importer les fichiers pour executer leur code.

```typescript
// index.ts
import { EmployeeSchema } from './document'
import { EmployeeMethods } from './methods'
import './methods'   // Execute le code pour attacher les methodes
import './virtuals'  // Execute le code pour attacher les virtuels
import { attachHooks } from './hooks'

attachHooks()

export default model('Employee', EmployeeSchema)
```

---

## Voir Aussi

- [BUGS.md](../maintenance/BUGS.md) - Bug sur les methodes Mongoose
- [CLAUDE.md](/apps/admin/CLAUDE.md) - Conventions models

---

*TODO: Ajouter schemas detailles pour chaque modele*
