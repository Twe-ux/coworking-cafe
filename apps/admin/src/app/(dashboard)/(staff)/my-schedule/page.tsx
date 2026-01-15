'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MonthlyCalendar } from '@/components/shared/calendar/MonthlyCalendar'
import { useShifts } from '@/hooks/useShifts'
import { useEmployees } from '@/hooks/useEmployees'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import type { Shift } from '@/types/shift'

// TODO: Get current user from session
// For now, hardcoded employee ID for testing
const CURRENT_USER_ID = '6788c8aae57c5f007896fec2' // Replace with actual user ID from session

const SHIFT_TYPES = {
  'opening': { label: 'Ouverture', color: '#3B82F6' },
  'closing': { label: 'Fermeture', color: '#8B5CF6' },
  'full-day': { label: 'Journée', color: '#10B981' },
  'morning': { label: 'Matin', color: '#F59E0B' },
  'afternoon': { label: 'Après-midi', color: '#EC4899' },
}

export default function MySchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Fetch shifts for current user only
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const { shifts, isLoading } = useShifts({
    employeeId: CURRENT_USER_ID,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    active: true,
  })

  const { employees } = useEmployees({ active: true })

  // Find current user employee data
  const currentEmployee = employees.find(emp => emp.id === CURRENT_USER_ID)

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const dateKey = format(shift.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(shift)
    return acc
  }, {} as Record<string, Shift[]>)

  // Split shifts by morning/afternoon
  const splitShiftsByTimeSlot = (dateShifts: Shift[]) => {
    const morning: Shift[] = []
    const afternoon: Shift[] = []

    dateShifts.forEach(shift => {
      const [hours] = shift.startTime.split(':').map(Number)
      const startMinutes = hours * 60 + parseInt(shift.startTime.split(':')[1])

      if (startMinutes < 14 * 60 + 30) {
        morning.push(shift)
      } else {
        afternoon.push(shift)
      }
    })

    return { morning, afternoon }
  }

  const renderCell = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayShifts = shiftsByDate[dateKey] || []

    if (dayShifts.length === 0) return null

    const { morning, afternoon } = splitShiftsByTimeSlot(dayShifts)

    return (
      <div className="flex flex-col h-full">
        {/* Morning slot */}
        <div className="flex-1 border-b border-gray-100 p-1 min-h-[50px]">
          {morning.map(shift => {
            const shiftType = SHIFT_TYPES[shift.type as keyof typeof SHIFT_TYPES]
            const color = shiftType?.color || '#6B7280'

            return (
              <div
                key={shift.id}
                className="text-xs rounded px-1.5 py-1 mb-1"
                style={{ backgroundColor: color }}
              >
                <div className="text-white font-medium truncate">
                  {shift.startTime} - {shift.endTime}
                </div>
                <div className="text-white/90 text-[10px] truncate">
                  {shiftType?.label || shift.type}
                </div>
              </div>
            )
          })}
        </div>

        {/* Afternoon slot */}
        <div className="flex-1 p-1 min-h-[50px]">
          {afternoon.map(shift => {
            const shiftType = SHIFT_TYPES[shift.type as keyof typeof SHIFT_TYPES]
            const color = shiftType?.color || '#6B7280'

            return (
              <div
                key={shift.id}
                className="text-xs rounded px-1.5 py-1 mb-1"
                style={{ backgroundColor: color }}
              >
                <div className="text-white font-medium truncate">
                  {shift.startTime} - {shift.endTime}
                </div>
                <div className="text-white/90 text-[10px] truncate">
                  {shiftType?.label || shift.type}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalShiftsThisMonth = shifts.length
  const totalHours = shifts.reduce((total, shift) => {
    const start = new Date(`2000-01-01 ${shift.startTime}`)
    let end = new Date(`2000-01-01 ${shift.endTime}`)
    if (end <= start) end.setDate(end.getDate() + 1)
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Planning</h1>
          <p className="text-muted-foreground mt-1">
            Consultez vos créneaux de travail
          </p>
        </div>

        {currentEmployee && (
          <Card className="w-fit">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-12 w-12" style={{ backgroundColor: currentEmployee.color }}>
                <AvatarFallback className="text-white font-semibold">
                  {currentEmployee.firstName[0]}{currentEmployee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{currentEmployee.fullName}</div>
                <div className="text-sm text-muted-foreground capitalize">{currentEmployee.role}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créneaux ce mois</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShiftsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures totales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochains créneaux</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shifts.filter(s => s.date >= new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              À venir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
          <CardDescription>
            Vue mensuelle de vos créneaux de travail
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <MonthlyCalendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              data={shifts}
              getDateForData={(shift) => shift.date}
              renderCell={renderCell}
              readOnly={true}
              cellHeight={120}
            />
          )}
        </CardContent>
      </Card>

      {/* Shift Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Légende des types de créneaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(SHIFT_TYPES).map(([key, { label, color }]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
