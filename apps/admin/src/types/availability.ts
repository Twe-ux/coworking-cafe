export interface Availability {
  id: string
  employeeId: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    role: string
    color: string
  }
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  dayOfWeekLabel: string
  startTime: string
  endTime: string
  timeRange: string
  isRecurring: boolean
  effectiveFrom?: Date
  effectiveUntil?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateAvailabilityInput {
  employeeId: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startTime: string
  endTime: string
  isRecurring?: boolean
  effectiveFrom?: Date | string
  effectiveUntil?: Date | string
  notes?: string
}

export interface UpdateAvailabilityInput {
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startTime?: string
  endTime?: string
  isRecurring?: boolean
  effectiveFrom?: Date | string
  effectiveUntil?: Date | string
  notes?: string
  isActive?: boolean
}

export interface UseAvailabilitiesOptions {
  employeeId?: string
  dayOfWeek?: number
  active?: boolean
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
] as const

export function getDayOfWeekLabel(day: number): string {
  const dayObj = DAYS_OF_WEEK.find(d => d.value === day)
  return dayObj?.label || 'Inconnu'
}
