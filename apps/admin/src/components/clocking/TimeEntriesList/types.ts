import type { Employee } from '@/hooks/useEmployees'
import type { TimeEntry as SharedTimeEntry } from '@/types/timeEntry'

// Local type for component state - API returns date/times as strings
export type TimeEntry = SharedTimeEntry

export interface EmployeeInfo {
  id: string
  firstName: string
  lastName: string
  fullName: string
  employeeRole: string
  color?: string
}

export interface GroupedTimeEntry {
  employeeId: string
  employee: Employee | EmployeeInfo
  date: string
  dateObj: Date
  morningShift?: TimeEntry
  afternoonShift?: TimeEntry
  allShifts: TimeEntry[]
  totalHours: number
  hasActiveShift: boolean
  hasError: boolean
}

export interface TimeEntriesFilters {
  employeeId: string
  startDate: string
  endDate: string
  status: string
}

export interface NewShiftData {
  employeeId: string
  date: string
  clockIn: string
  clockOut: string
}

export interface EditingCell {
  entryId: string
  field: 'clockIn' | 'clockOut' | 'date'
}
