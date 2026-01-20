/**
 * Constants for ShiftAssignment component
 */

import type { ShiftTypeConfig } from './types'

/**
 * Default shift types configuration
 */
export const DEFAULT_SHIFT_TYPES: Record<string, ShiftTypeConfig> = {
  morning: {
    label: 'Morning',
    defaultStart: '09:30',
    defaultEnd: '14:30',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'sunrise',
  },
  afternoon: {
    label: 'Afternoon',
    defaultStart: '12:00',
    defaultEnd: '18:00',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'sun',
  },
  evening: {
    label: 'Evening',
    defaultStart: '18:00',
    defaultEnd: '22:00',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'sunset',
  },
  night: {
    label: 'Night',
    defaultStart: '22:00',
    defaultEnd: '06:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'moon',
  },
}

/**
 * Available locations for shifts
 */
export const LOCATIONS = [
  'Reception',
  'Main Floor',
  'Meeting Rooms',
  'Kitchen Area',
  'Security Desk',
  'Maintenance Room',
  'Parking Area',
  'Rooftop Terrace',
] as const

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  LAST_SELECTED_EMPLOYEE: 'lastSelectedEmployeeId',
  ALL_SHIFT_TYPES: 'allShiftTypes',
} as const

/**
 * Default new shift type configuration
 */
export const DEFAULT_NEW_SHIFT_TYPE: ShiftTypeConfig = {
  label: '',
  defaultStart: '09:00',
  defaultEnd: '17:00',
  color: 'bg-gray-100 text-gray-800 border-gray-200',
  icon: 'bolt',
}

/**
 * Emoji mapping for shift type icons
 */
export const ICON_EMOJI_MAP: Record<string, string> = {
  sunrise: 'sunrise',
  sun: 'sun',
  sunset: 'sunset',
  moon: 'moon',
  bolt: 'bolt',
  case: 'briefcase',
  office: 'building-2',
  wrench: 'wrench',
}

/**
 * Quick emoji picker options
 */
export const QUICK_EMOJI_OPTIONS = [
  'sunrise',
  'sun',
  'sunset',
  'moon',
  'bolt',
  'briefcase',
  'building-2',
  'wrench',
] as const
