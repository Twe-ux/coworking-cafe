import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Employee } from '@/hooks/useEmployees'
import type {
  TimeEntry,
  GroupedTimeEntry,
  TimeEntriesFilters,
} from '../types'
import { isShiftBeforeCutoff } from '@/lib/schedule/utils'

interface UseTimeEntriesDataOptions {
  employees: Employee[]
  currentDate: Date
}

interface UseTimeEntriesDataReturn {
  timeEntries: TimeEntry[]
  groupedEntries: GroupedTimeEntry[]
  availableEmployees: Employee[]
  availableDates: string[]
  isLoading: boolean
  filters: TimeEntriesFilters
  handleFilterChange: (key: string, value: string) => void
  clearFilters: () => void
  fetchTimeEntries: () => Promise<void>
}

export function useTimeEntriesData({
  employees,
  currentDate,
}: UseTimeEntriesDataOptions): UseTimeEntriesDataReturn {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [groupedEntries, setGroupedEntries] = useState<GroupedTimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<TimeEntriesFilters>({
    employeeId: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
  })

  // Get employee by ID
  const getEmployee = useCallback(
    (employeeId: string) => employees.find((emp) => emp.id === employeeId),
    [employees]
  )

  // Group time entries by employee and date
  const groupTimeEntries = useCallback(
    (entries: TimeEntry[]): GroupedTimeEntry[] => {
      const grouped = new Map<string, GroupedTimeEntry>()

      entries.forEach((entry) => {
        const employee = entry.employee || getEmployee(entry.employeeId)
        if (!employee) return

        const dateKey = `${entry.employeeId}-${entry.date}`

        if (!grouped.has(dateKey)) {
          const [year, month, day] = entry.date.split('-').map(Number)
          const dateObj = new Date(year, month - 1, day)

          grouped.set(dateKey, {
            employeeId: entry.employeeId,
            employee,
            date: dateObj.toLocaleDateString('fr-FR'),
            rawDate: entry.date,
            dateObj,
            totalHours: 0,
            hasActiveShift: false,
            hasError: false,
            allShifts: [],
          })
        }

        const group = grouped.get(dateKey)!
        group.allShifts.push(entry)

        // Assign to Shift 1 / Shift 2 columns
        // 1 shift: cutoff determines column (before 14:30 → Shift 1, after → Shift 2)
        // 2 shifts: chronological order (first → Shift 1, second → Shift 2)
        const sorted = [...group.allShifts].sort((a, b) => {
          const [aH, aM] = a.clockIn.split(':').map(Number)
          const [bH, bM] = b.clockIn.split(':').map(Number)
          return aH * 60 + aM - (bH * 60 + bM)
        })

        group.morningShift = undefined
        group.afternoonShift = undefined

        if (sorted.length === 1) {
          if (isShiftBeforeCutoff(sorted[0].clockIn)) {
            group.morningShift = sorted[0]
          } else {
            group.afternoonShift = sorted[0]
          }
        } else if (sorted.length >= 2) {
          group.morningShift = sorted[0]
          group.afternoonShift = sorted[1]
        }

        group.totalHours = group.allShifts.reduce(
          (total, shift) => total + (shift.totalHours || 0),
          0
        )
        group.hasActiveShift = group.allShifts.some((s) => s.status === 'active')
        group.hasError = group.allShifts.some((s) => s.hasError === true)
      })

      return Array.from(grouped.values()).sort(
        (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      )
    },
    [getEmployee]
  )

  // Available employees (those with time entries)
  const availableEmployees = useMemo(() => {
    const employeeIds = new Set(timeEntries.map((entry) => entry.employeeId))
    return employees.filter((emp) => employeeIds.has(emp.id))
  }, [employees, timeEntries])

  // Available dates
  const availableDates = useMemo(() => {
    const dates = new Set(timeEntries.map((entry) => entry.date))
    return Array.from(dates).sort()
  }, [timeEntries])

  // Fetch time entries
  const fetchTimeEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.employeeId && filters.employeeId !== 'all') {
        params.append('employeeId', filters.employeeId)
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      const startOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const lastDay = new Date(year, month + 1, 0).getDate()
      const endOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      params.append('startDate', filters.startDate || startOfMonthStr)
      params.append('endDate', filters.endDate || endOfMonthStr)

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

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ employeeId: '', startDate: '', endDate: '', status: '' })
  }

  return {
    timeEntries,
    groupedEntries,
    availableEmployees,
    availableDates,
    isLoading,
    filters,
    handleFilterChange,
    clearFilters,
    fetchTimeEntries,
  }
}
