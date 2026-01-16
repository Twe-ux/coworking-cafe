'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Employee } from '@/hooks/useEmployees'
import { Calendar, Clock, Download, Filter, Plus, Trash2, Edit2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface TimeEntry {
  id: string
  employeeId: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    role: string
    color: string
  }
  date: Date
  clockIn: Date
  clockOut?: Date | null
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY'
  errorMessage?: string
}

interface GroupedTimeEntry {
  employeeId: string
  employee:
    | Employee
    | {
        id: string
        firstName: string
        lastName: string
        role: string
        color: string
      }
  date: string
  dateObj: Date
  morningShift?: TimeEntry
  afternoonShift?: TimeEntry
  allShifts: TimeEntry[]
  totalHours: number
  hasActiveShift: boolean
  hasError: boolean
}

interface TimeEntriesListProps {
  employees: Employee[]
  currentDate: Date
  className?: string
}

export default function TimeEntriesList({
  employees,
  currentDate,
  className = '',
}: TimeEntriesListProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [groupedEntries, setGroupedEntries] = useState<GroupedTimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCell, setEditingCell] = useState<{
    entryId: string
    field: 'clockIn' | 'clockOut' | 'date'
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState({
    employeeId: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
  })
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false)
  const [newShift, setNewShift] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
  })
  const [isCreatingShift, setIsCreatingShift] = useState(false)

  // Calculer les options de filtre basées sur les données existantes
  const availableEmployees = useMemo(() => {
    const employeeIds = new Set(timeEntries.map((entry) => entry.employeeId))
    return employees.filter((emp) => employeeIds.has(emp.id))
  }, [employees, timeEntries])

  const availableDates = useMemo(() => {
    // entry.date is already "YYYY-MM-DD" string
    const dates = new Set(timeEntries.map((entry) => entry.date))
    return Array.from(dates).sort()
  }, [timeEntries])

  // Fonction pour déterminer si un shift est avant 14h30
  const isShiftBeforeCutoff = (clockIn: string) => {
    // clockIn is "HH:mm" format
    const [hours, minutes] = clockIn.split(':').map(Number)
    const shiftMinutes = hours * 60 + minutes
    const cutoffMinutes = 14 * 60 + 30 // 14h30
    return shiftMinutes < cutoffMinutes
  }

  const getEmployee = useCallback(
    (employeeId: string) => {
      return employees.find((emp) => emp.id === employeeId)
    },
    [employees]
  )

  // Fonction pour grouper les time entries par employé et date
  const groupTimeEntries = useCallback(
    (entries: TimeEntry[]): GroupedTimeEntry[] => {
      const grouped = new Map<string, GroupedTimeEntry>()

      entries.forEach((entry) => {
        const employee = entry.employee || getEmployee(entry.employeeId)
        if (!employee) return

        // entry.date is already "YYYY-MM-DD" string
        const dateKey = `${entry.employeeId}-${entry.date}`
        const isMorning = isShiftBeforeCutoff(entry.clockIn)

        if (!grouped.has(dateKey)) {
          // Parse date string "YYYY-MM-DD" to Date object
          const [year, month, day] = entry.date.split('-').map(Number)
          const dateObj = new Date(year, month - 1, day)

          grouped.set(dateKey, {
            employeeId: entry.employeeId,
            employee,
            date: dateObj.toLocaleDateString('fr-FR'),
            dateObj,
            totalHours: 0,
            hasActiveShift: false,
            hasError: false,
            allShifts: [],
          })
        }

        const group = grouped.get(dateKey)!
        group.allShifts.push(entry)

        // Organiser les shifts: premier shift dans morningShift, deuxième dans afternoonShift
        // Indépendamment de l'heure de début
        // clockIn is "HH:mm" format, convert to minutes for comparison
        const sortedShifts = group.allShifts.sort((a, b) => {
          const [aH, aM] = a.clockIn.split(':').map(Number)
          const [bH, bM] = b.clockIn.split(':').map(Number)
          return (aH * 60 + aM) - (bH * 60 + bM)
        })

        if (sortedShifts.length >= 1) {
          group.morningShift = sortedShifts[0]
        }
        if (sortedShifts.length >= 2) {
          group.afternoonShift = sortedShifts[1]
        }

        group.totalHours = group.allShifts.reduce(
          (total, shift) => total + (shift.totalHours || 0),
          0
        )
        group.hasActiveShift = group.allShifts.some(
          (shift) => shift.status === 'active'
        )
        group.hasError = group.allShifts.some(
          (shift) => shift.hasError === true
        )
      })

      return Array.from(grouped.values()).sort(
        (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      )
    },
    [getEmployee]
  )

  const fetchTimeEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.employeeId && filters.employeeId !== 'all') params.append('employeeId', filters.employeeId)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)

      // Utiliser currentDate pour filtrer par mois automatiquement
      // Format directly as "YYYY-MM-DD" to avoid timezone issues
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      // First day of month
      const startOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`

      // Last day of month
      const lastDay = new Date(year, month + 1, 0).getDate()
      const endOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      // Si des filtres de date spécifiques sont définis, les utiliser à la place
      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      } else {
        params.append('startDate', startOfMonthStr)
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      } else {
        params.append('endDate', endOfMonthStr)
      }

      const response = await fetch(`/api/time-entries?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        const entries = data.data || []
        setTimeEntries(entries)
        setGroupedEntries(groupTimeEntries(entries))
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, currentDate, groupTimeEntries])

  useEffect(() => {
    fetchTimeEntries()
  }, [fetchTimeEntries])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: '',
    })
  }

  const formatHours = (hours?: number) => {
    if (!hours) return '--'

    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (entry: TimeEntry) => {
    if (entry.status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <div className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          En cours
        </Badge>
      )
    }
    return <Badge variant="secondary">Terminé</Badge>
  }

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '--:--'
    // time is already in "HH:mm" format
    return time
  }

  const renderEditableTime = (
    shift: TimeEntry,
    field: 'clockIn' | 'clockOut'
  ) => {
    const isEditing =
      editingCell?.entryId === shift.id && editingCell?.field === field
    const time = field === 'clockIn' ? shift.clockIn : shift.clockOut

    if (!time && field === 'clockOut') {
      return (
        <div
          className="cursor-pointer rounded p-1 text-center text-gray-400 hover:bg-gray-100"
          onClick={() => handleCellClick(shift, field)}
          title="Cliquez pour ajouter l'heure de fin"
        >
          --:--
        </div>
      )
    }

    if (isEditing) {
      return (
        <Input
          type="time"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="h-8 w-12 p-1 text-sm [&::-webkit-calendar-picker-indicator]:hidden"
          autoFocus
        />
      )
    }

    return (
      <div
        className="cursor-pointer rounded p-1 transition-colors hover:bg-blue-50"
        onClick={() => handleCellClick(shift, field)}
        title={`Cliquez pour modifier l'heure ${field === 'clockIn' ? "d'arrivée" : 'de départ'}`}
      >
        {formatTime(time)}
      </div>
    )
  }

  const renderEditableDate = (entry: TimeEntry) => {
    const isEditing =
      editingCell?.entryId === entry.id && editingCell?.field === 'date'

    if (isEditing) {
      return (
        <Input
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="h-6 w-28 p-1 text-xs"
          autoFocus
        />
      )
    }

    return (
      <div
        className="cursor-pointer rounded p-1 text-sm transition-colors hover:bg-blue-50"
        onClick={() => handleCellClick(entry, 'date')}
        title="Cliquez pour modifier la date"
      >
        {(() => {
          // entry.date is "YYYY-MM-DD" format
          const [year, month, day] = entry.date.split('-').map(Number)
          const dateObj = new Date(year, month - 1, day)
          return dateObj.toLocaleDateString('fr-FR')
        })()}
      </div>
    )
  }

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce shift ?')) {
      return
    }

    try {
      const response = await fetch(`/api/time-entries/${shiftId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await fetchTimeEntries()
      } else {
        alert(result.error || 'Erreur lors de la suppression du shift')
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Erreur lors de la suppression du shift')
    }
  }

  const renderShiftCell = (shift: TimeEntry | undefined, isActive: boolean) => {
    if (!shift) {
      return <div className="text-center text-gray-400">--</div>
    }

    const hasError = shift.hasError === true

    return (
      <div
        className={`text-sm ${
          hasError
            ? 'font-medium text-red-700'
            : isActive
              ? 'font-medium text-green-700'
              : ''
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            {renderEditableTime(shift, 'clockIn')}
            <span className="px-1">-</span>
            {renderEditableTime(shift, 'clockOut')}
          </div>
          <button
            onClick={() => handleDeleteShift(shift.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
            title="Supprimer ce shift"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {shift.status === 'active' && !hasError && (
          <div className="mt-1 flex justify-center">
            <Badge className="bg-green-100 text-xs text-green-800">
              <div className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              En cours
            </Badge>
          </div>
        )}
        {hasError && (
          <div className="mt-1 flex justify-center">
            <Badge
              className="bg-red-100 text-xs text-red-800"
              title={shift.errorMessage}
            >
              <div className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
              Erreur
            </Badge>
          </div>
        )}
      </div>
    )
  }

  const handleCellClick = (
    entry: TimeEntry,
    field: 'clockIn' | 'clockOut' | 'date'
  ) => {
    if (isSaving) return

    let value = ''
    if (field === 'clockIn') {
      // clockIn is already "HH:mm" format
      value = entry.clockIn
    } else if (field === 'clockOut' && entry.clockOut) {
      // clockOut is already "HH:mm" format
      value = entry.clockOut
    } else if (field === 'date') {
      // date is already "YYYY-MM-DD" format
      value = entry.date
    }

    setEditingCell({ entryId: entry.id, field })
    setEditValue(value)
  }

  const handleCellSave = async () => {
    if (!editingCell || !editValue.trim()) {
      setEditingCell(null)
      return
    }

    setIsSaving(true)
    try {
      interface TimeEntryUpdate {
        date?: string
        clockIn?: string
        clockOut?: string | null
      }

      const updateData: TimeEntryUpdate = {}

      if (editingCell.field === 'date') {
        // editValue is already in "YYYY-MM-DD" format from the date input
        updateData.date = editValue
      } else if (editingCell.field === 'clockIn') {
        // editValue is already in "HH:mm" format from the time input
        updateData.clockIn = editValue
      } else if (editingCell.field === 'clockOut') {
        // editValue is already in "HH:mm" format from the time input
        updateData.clockOut = editValue
      }

      const response = await fetch(`/api/time-entries/${editingCell.entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchTimeEntries()
        setEditingCell(null)
        setEditValue('')
      } else {
        console.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      handleCellCancel()
    }
  }

  const handleCreateShift = async () => {
    if (!newShift.employeeId || !newShift.date || !newShift.clockIn) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsCreatingShift(true)
    try {
      // Créer les dates pour clockIn et clockOut
      const baseDate = new Date(newShift.date)
      const [clockInHours, clockInMinutes] = newShift.clockIn
        .split(':')
        .map(Number)

      const clockInDate = new Date(baseDate)
      clockInDate.setHours(clockInHours, clockInMinutes, 0, 0)

      let clockOutDate = null
      if (newShift.clockOut) {
        const [clockOutHours, clockOutMinutes] = newShift.clockOut
          .split(':')
          .map(Number)
        clockOutDate = new Date(baseDate)
        clockOutDate.setHours(clockOutHours, clockOutMinutes, 0, 0)

        // Si l'heure de fin est avant l'heure de début, c'est le jour suivant
        if (clockOutDate <= clockInDate) {
          clockOutDate.setDate(clockOutDate.getDate() + 1)
        }
      }

      // Format dates as strings: date as "YYYY-MM-DD", times as "HH:mm"
      const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const formatTime = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }

      const shiftData = {
        employeeId: newShift.employeeId,
        date: formatDate(baseDate),
        clockIn: formatTime(clockInDate),
        clockOut: clockOutDate ? formatTime(clockOutDate) : null,
        status: clockOutDate ? 'completed' : 'active',
      }

      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftData),
      })

      const result = await response.json()

      if (result.success) {
        setShowAddShiftDialog(false)
        setNewShift({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          clockIn: '',
          clockOut: '',
        })
        await fetchTimeEntries() // Recharger les données
      } else {
        alert(result.error || 'Erreur lors de la création du shift')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      alert('Erreur lors de la création du shift')
    } finally {
      setIsCreatingShift(false)
    }
  }

  const handleCancelAddShift = () => {
    setShowAddShiftDialog(false)
    setNewShift({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      clockIn: '',
      clockOut: '',
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des Pointages
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddShiftDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un shift
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label htmlFor="employee-select">Employé (avec pointages)</Label>
              <Select
                value={filters.employeeId}
                onValueChange={(value) =>
                  handleFilterChange('employeeId', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les employés avec pointages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tous les employés avec pointages
                  </SelectItem>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${employee.color}`}
                        />
                        {employee.firstName} {employee.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specific-date">
                Date spécifique (avec pointages)
              </Label>
              <Select
                value={
                  filters.startDate && filters.startDate === filters.endDate
                    ? filters.startDate
                    : ''
                }
                onValueChange={(value) => {
                  if (value) {
                    handleFilterChange('startDate', value)
                    handleFilterChange('endDate', value)
                  } else {
                    handleFilterChange('startDate', '')
                    handleFilterChange('endDate', '')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les dates avec pointages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Toutes les dates avec pointages
                  </SelectItem>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {(() => {
                        // date is "YYYY-MM-DD" format
                        const [year, month, day] = date.split('-').map(Number)
                        const dateObj = new Date(year, month - 1, day)
                        return dateObj.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      })()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-select">Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="destructive" size="sm" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-gray-600">Chargement des pointages...</p>
            </div>
          ) : groupedEntries.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Aucun pointage trouvé
              </h3>
              <p className="text-gray-600">
                Aucun pointage ne correspond aux critères sélectionnés.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] text-center">Date</TableHead>
                  <TableHead className="w-[200px] text-center">
                    Employé
                  </TableHead>
                  <TableHead className="w-[180px] text-center">
                    Shift 1
                  </TableHead>
                  <TableHead className="w-[180px] text-center">
                    Shift 2
                  </TableHead>
                  <TableHead className="w-[100px] text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedEntries.map((group, index) => (
                  <TableRow
                    key={`${group.employeeId}-${group.date}`}
                    className={
                      group.hasError
                        ? 'border-red-200 bg-red-50'
                        : group.hasActiveShift
                          ? 'bg-green-50'
                          : ''
                    }
                  >
                    <TableCell className="text-center">
                      {/* Utilise la première entrée disponible pour l'édition de la date */}
                      {group.morningShift ? (
                        <div className="flex justify-center">
                          {renderEditableDate(group.morningShift)}
                        </div>
                      ) : group.afternoonShift ? (
                        <div className="flex justify-center">
                          {renderEditableDate(group.afternoonShift)}
                        </div>
                      ) : (
                        <div className="text-sm">{group.date}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${group.employee.color}`}
                        />
                        <div>
                          <div className="font-medium">
                            {group.employee.firstName} {group.employee.lastName}
                          </div>
                          {/* <div className="text-sm text-gray-600">
                            {group.employee.role}
                          </div> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {renderShiftCell(
                        group.morningShift,
                        group.morningShift?.status === 'active'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderShiftCell(
                        group.afternoonShift,
                        group.afternoonShift?.status === 'active'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={`font-mono font-medium ${
                          group.hasError
                            ? 'text-red-700'
                            : group.hasActiveShift
                              ? 'text-green-700'
                              : ''
                        }`}
                      >
                        {formatHours(group.totalHours)}
                        {group.hasError && (
                          <div className="mt-1 text-xs text-red-600">
                            ⚠️ Erreur pointage
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Ligne de total */}
                {groupedEntries.length > 0 && (
                  <TableRow
                    className={`border-t-2 border-gray-300 font-semibold ${
                      groupedEntries.some((group) => group.hasError)
                        ? 'bg-red-100 text-red-800'
                        : groupedEntries.some((group) => group.hasActiveShift)
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <TableCell className="text-center">
                      <div className="font-bold">TOTAL</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold">
                        {groupedEntries.length} journée
                        {groupedEntries.length > 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold">
                        {groupedEntries.filter((g) => g.morningShift).length}{' '}
                        shift
                        {groupedEntries.filter((g) => g.morningShift).length > 1
                          ? 's'
                          : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold">
                        {groupedEntries.filter((g) => g.afternoonShift).length}{' '}
                        shift
                        {groupedEntries.filter((g) => g.afternoonShift).length >
                        1
                          ? 's'
                          : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-mono text-lg font-bold">
                        {formatHours(
                          groupedEntries.reduce(
                            (total, group) => total + group.totalHours,
                            0
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instructions and Summary */}
      {groupedEntries.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-center">
            <p className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
              💡 Cliquez sur les heures ou dates pour les modifier directement
            </p>
          </div>
          <div className="flex justify-center">
            <p className="text-sm text-gray-600">
              {groupedEntries.length} journée
              {groupedEntries.length > 1 ? 's' : ''} de travail affiché
              {groupedEntries.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Dialog for adding new shift */}
      {showAddShiftDialog && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              Ajouter un nouveau shift
            </h3>

            <div className="space-y-4">
              {/* Sélection de l'employé */}
              <div>
                <Label htmlFor="shift-employee">Employé *</Label>
                <Select
                  value={newShift.employeeId}
                  onValueChange={(value) =>
                    setNewShift((prev) => ({ ...prev, employeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${employee.color}`}
                          />
                          {employee.firstName} {employee.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="shift-date">Date *</Label>
                <Input
                  id="shift-date"
                  type="date"
                  value={newShift.date}
                  onChange={(e) =>
                    setNewShift((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              {/* Heure de début */}
              <div>
                <Label htmlFor="shift-clockin">Heure de début *</Label>
                <Input
                  id="shift-clockin"
                  type="time"
                  value={newShift.clockIn}
                  onChange={(e) =>
                    setNewShift((prev) => ({
                      ...prev,
                      clockIn: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Heure de fin */}
              <div>
                <Label htmlFor="shift-clockout">Heure de fin (optionnel)</Label>
                <Input
                  id="shift-clockout"
                  type="time"
                  value={newShift.clockOut}
                  onChange={(e) =>
                    setNewShift((prev) => ({
                      ...prev,
                      clockOut: e.target.value,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Laisser vide pour créer un shift actif
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAddShift}
                disabled={isCreatingShift}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateShift} disabled={isCreatingShift}>
                {isCreatingShift ? 'Création...' : 'Créer le shift'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
