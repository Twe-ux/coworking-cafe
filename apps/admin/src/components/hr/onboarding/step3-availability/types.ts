import type { Availability, AvailabilitySlot, WeeklyDistributionData } from '@/types/onboarding'

/**
 * Time slot with unique identifier for React keys
 */
export interface TimeSlotWithId extends AvailabilitySlot {
  id: string
}

/**
 * Day configuration for availability selection
 */
export interface DayConfig {
  key: keyof Availability
  label: string
}

/**
 * Props for availability form hook
 */
export interface UseAvailabilityFormProps {
  initialAvailability: Availability
  initialWeeklyDistribution: WeeklyDistributionData
  contractualHours: number
}

/**
 * Return type for availability form hook
 */
export interface UseAvailabilityFormReturn {
  availability: Availability
  weeklyDistribution: WeeklyDistributionData
  toggleDay: (day: keyof Availability) => void
  addSlot: (day: keyof Availability) => void
  removeSlot: (day: keyof Availability, slotId: string) => void
  updateSlot: (day: keyof Availability, slotId: string, field: 'start' | 'end', value: string) => void
  updateWeeklyHours: (day: keyof Availability, week: 'week1' | 'week2' | 'week3' | 'week4', value: string) => void
  calculateWeekTotal: (week: string) => number
  calculateGrandTotal: () => number
  isDistributionValid: boolean
  hasAvailability: boolean
  canSubmit: boolean
  getCleanedAvailability: () => Availability
}

/**
 * Days of the week configuration
 */
export const DAYS: readonly DayConfig[] = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const

/**
 * Weeks configuration for distribution table
 */
export const WEEKS: readonly ('week1' | 'week2' | 'week3' | 'week4')[] = [
  'week1',
  'week2',
  'week3',
  'week4',
] as const
