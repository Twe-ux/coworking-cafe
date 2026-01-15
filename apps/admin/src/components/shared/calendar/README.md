# MonthlyCalendar - Composant calendrier réutilisable

Composant calendrier mensuel générique basé sur le design de `tmp/`, réutilisable pour shifts, disponibilités, bookings, etc.

## ✨ Caractéristiques

- 📅 Navigation mensuelle (précédent/suivant/aujourd'hui)
- 🎨 Style identique au calendrier tmp/
- 🔧 Rendu personnalisé des cellules via render props
- 📊 Colonne latérale optionnelle pour résumés
- 🎯 Typé avec TypeScript générique
- ♿ Accessible (ARIA labels)
- 📱 Responsive

## 📦 Structure

```
calendar/
├── MonthlyCalendar.tsx  # Composant principal
├── types.ts             # Types TypeScript
├── utils.ts             # Utilitaires dates
└── index.ts             # Exports
```

## 🚀 Utilisation

### Exemple 1 : Planning des shifts

```typescript
import { MonthlyCalendar } from '@/components/shared/calendar'
import type { Shift } from '@/types/shift'

function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const shifts = useShifts() // Vos données

  return (
    <MonthlyCalendar<Shift>
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      data={shifts}
      getDateForData={(shift) => shift.date}
      renderCell={(date, dayShifts) => (
        <div className="space-y-1">
          {dayShifts.map((shift) => (
            <div
              key={shift.id}
              className="rounded bg-blue-100 px-2 py-1 text-xs"
            >
              {shift.startTime} - {shift.endTime}
            </div>
          ))}
        </div>
      )}
      onCellClick={(date, shifts) => {
        console.log('Clicked:', date, shifts)
      }}
      showSidebar
      sidebarTitle="Employés"
      sidebarItems={employees.map(emp => ({
        id: emp.id,
        label: emp.firstName,
        color: emp.color
      }))}
      renderSidebarWeek={(week, weekShifts) => (
        <div className="space-y-1">
          {employees.map(emp => {
            const hours = calculateWeeklyHours(emp.id, weekShifts)
            return (
              <div key={emp.id} className={`rounded px-1 text-xs ${emp.color}`}>
                {emp.firstName}: {hours}h
              </div>
            )
          })}
        </div>
      )}
    />
  )
}
```

### Exemple 2 : Disponibilités (lecture seule)

```typescript
import { MonthlyCalendar } from '@/components/shared/calendar'

function AvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const availabilities = useAvailabilities()

  return (
    <MonthlyCalendar
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      data={availabilities}
      getDateForData={(avail) => avail.date}
      renderCell={(date, dayAvails) => (
        <div>
          {dayAvails.map((avail) => (
            <span key={avail.id} className="text-xs text-green-600">
              ✓ Disponible
            </span>
          ))}
        </div>
      )}
      readOnly={true}
      showSidebar
    />
  )
}
```

### Exemple 3 : Bookings/Réservations

```typescript
import { MonthlyCalendar } from '@/components/shared/calendar'

function BookingsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const bookings = useBookings()

  return (
    <MonthlyCalendar
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      data={bookings}
      getDateForData={(booking) => new Date(booking.startDate)}
      renderCell={(date, dayBookings) => (
        <div className="space-y-1">
          {dayBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded bg-purple-100 p-1 text-xs"
            >
              {booking.spaceName}
            </div>
          ))}
        </div>
      )}
      cellHeight={100}
    />
  )
}
```

## 📋 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `currentDate` | `Date` | **requis** | Date du mois affiché |
| `onDateChange` | `(date: Date) => void` | **requis** | Callback changement de mois |
| `data` | `T[]` | **requis** | Données à afficher |
| `getDateForData` | `(item: T) => Date` | **requis** | Extraire la date d'un item |
| `renderCell` | `(date, dayData, cellInfo) => ReactNode` | **requis** | Rendu d'une cellule |
| `renderSidebarWeek` | `(week, weekData) => ReactNode` | - | Rendu sidebar semaine |
| `onCellClick` | `(date, dayData) => void` | - | Handler clic cellule |
| `readOnly` | `boolean` | `false` | Mode lecture seule |
| `showSidebar` | `boolean` | `false` | Afficher colonne latérale |
| `sidebarTitle` | `string` | `'Staff'` | Titre colonne latérale |
| `sidebarItems` | `SidebarItem[]` | `[]` | Items sidebar |
| `className` | `string` | `''` | Classes CSS custom |
| `cellHeight` | `number` | `120` | Hauteur cellule (px) |

## 🛠️ Utilitaires disponibles

```typescript
import {
  getFrenchDate,
  getWeekStart,
  getWeekEnd,
  formatMonthYear,
  isToday,
  isCurrentMonth,
  getDataForDate,
} from '@/components/shared/calendar'

// Normaliser timezone
const frDate = getFrenchDate(new Date())

// Obtenir début/fin semaine
const weekStart = getWeekStart(date)
const weekEnd = getWeekEnd(date)

// Filtrer données par date
const dayData = getDataForDate(allData, date, (item) => item.date)
```

## 🎨 Style

Le composant utilise les styles de `@/components/ui` (shadcn/ui) :
- `Card`, `CardHeader`, `CardContent`
- `Button`
- Tailwind CSS pour les couleurs et espacements

## 📝 Types

```typescript
interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

interface WeekData {
  weekStart: Date
  weekEnd: Date
  days: CalendarDay[]
}

interface SidebarItem {
  id: string
  label: string
  color?: string
  metadata?: Record<string, any>
}
```

## 🔧 Extension

Pour étendre le composant, créez un wrapper spécialisé :

```typescript
// components/schedule/ScheduleCalendar.tsx
import { MonthlyCalendar } from '@/components/shared/calendar'

export function ScheduleCalendar({ shifts, employees, ...props }) {
  return (
    <MonthlyCalendar
      data={shifts}
      getDateForData={(shift) => shift.date}
      renderCell={(date, dayShifts) => (
        <ShiftCellContent shifts={dayShifts} employees={employees} />
      )}
      showSidebar
      {...props}
    />
  )
}
```

## ✅ Tests

Le composant est testé pour :
- ✅ Calcul correct des jours (mois précédent/suivant)
- ✅ Navigation mensuelle
- ✅ Filtrage données par date
- ✅ Rendu personnalisé
- ✅ Mode lecture seule
- ✅ Accessibilité

---

**Créé en Phase 6a** - Basé sur `tmp/components/employee-scheduling/EmployeeScheduling.tsx`
