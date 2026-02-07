/**
 * Types pour les shifts (créneaux de travail)
 */

export interface ShiftEmployee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  employeeRole: string
  color: string
}

export interface Shift {
  id: string
  employeeId: string
  employee?: ShiftEmployee
  date: string // Format "YYYY-MM-DD"
  startTime: string // Format "HH:mm"
  endTime: string // Format "HH:mm"
  type: string
  location?: string
  notes?: string
  isActive: boolean
  timeRange: string
  createdAt: string
  updatedAt: string
}

/**
 * Extended Shift interface for unavailability requests
 * Used in AvailabilityWeekCard to mark requested unavailability
 * Also allows Date objects for internal use during shift creation
 */
export interface ShiftWithUnavailability extends Omit<Shift, 'date' | 'createdAt' | 'updatedAt'> {
  date: string | Date
  createdAt: string | Date
  updatedAt: string | Date
  _id?: string // MongoDB internal ID
  _unavailabilityRequested?: boolean
}

export interface CreateShiftInput {
  employeeId: string
  date: string // Format "YYYY-MM-DD"
  startTime: string // Format "HH:mm"
  endTime: string // Format "HH:mm"
  type: string
  location?: string
  notes?: string
}

export interface UpdateShiftInput {
  employeeId?: string
  date?: string // Format "YYYY-MM-DD"
  startTime?: string // Format "HH:mm"
  endTime?: string // Format "HH:mm"
  type?: string
  location?: string
  notes?: string
  isActive?: boolean
}

export interface UseShiftsOptions {
  employeeId?: string
  startDate?: string
  endDate?: string
  type?: string
  active?: boolean
}

export interface ShiftStatistics {
  total: number
  active: number
  inactive: number
  byType: Record<string, number>
  totalHours: number
}

// Types de créneaux prédéfinis
export const SHIFT_TYPES = {
  morning: {
    label: 'Matin',
    time: '08:00-12:00',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  afternoon: {
    label: 'Après-midi',
    time: '12:00-18:00',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  evening: {
    label: 'Soirée',
    time: '18:00-22:00',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  night: {
    label: 'Nuit',
    time: '22:00-06:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  custom: {
    label: 'Personnalisé',
    time: 'Variable',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
} as const

export type ShiftType = keyof typeof SHIFT_TYPES
