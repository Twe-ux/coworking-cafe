/**
 * Types for EmployeeScheduling components
 */

import type { Employee } from '@/hooks/useEmployees'
import type { Shift } from '@/hooks/useShifts'
import type { TimeEntry } from '@/types/timeEntry'

export interface EmployeeSchedulingProps {
  className?: string
  employees?: Employee[]
  shifts?: Shift[]
  onAddShift?: (date: Date) => void
  readOnly?: boolean
  userRole?: string
}

export interface WeekData {
  weekStart: Date
  weekEnd: Date
  shifts: Shift[]
}

export interface PositionedShifts {
  employee: Employee
  shifts: Shift[]
  morningShifts: Shift[]
  afternoonShifts: Shift[]
}

export interface OrganizedShifts {
  morning: Shift[]
  afternoon: Shift[]
}

// View mode for scheduling
export type ViewMode = 'calendar' | 'list' | 'pointage'

// Default employees array
export const DEFAULT_EMPLOYEES: Employee[] = []

// Shift type configurations
export const SHIFT_TYPES: Record<string, { label: string; time: string; color: string }> = {
  morning: {
    label: 'Morning',
    time: '08:00-12:00',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  afternoon: {
    label: 'Afternoon',
    time: '12:00-18:00',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  evening: {
    label: 'Evening',
    time: '18:00-22:00',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  night: {
    label: 'Night',
    time: '22:00-06:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
}

// Days of week labels
export const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

// Cutoff time for morning/afternoon split (14:30)
export const CUTOFF_HOUR = 14
export const CUTOFF_MINUTE = 30
export const CUTOFF_TIME_IN_MINUTES = CUTOFF_HOUR * 60 + CUTOFF_MINUTE
