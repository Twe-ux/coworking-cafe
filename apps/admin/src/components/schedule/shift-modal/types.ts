/**
 * Types for ShiftModal components
 */

import type { Shift, CreateShiftInput } from '@/types/shift'
import type { Employee } from '@/types/hr'

export interface ShiftTypeConfig {
  label: string
  defaultStart: string
  defaultEnd: string
  color: string
  icon: string
}

export interface ShiftModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateShiftInput) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (id: string, data: Partial<Shift>) => Promise<{ success: boolean; error?: string }>
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>
  employees: Employee[]
  selectedDate: string // YYYY-MM-DD format (always string, never Date)
  existingShift?: Shift | null
}

export interface ShiftFormData {
  employeeId: string
  date: string // YYYY-MM-DD format (always string, never Date)
  startTime: string
  endTime: string
  type: string
  location: string
}

export interface FormErrors {
  employeeId?: string
  startTime?: string
  endTime?: string
  submit?: string
  [key: string]: string | undefined
}

// Default shift types configuration
export const DEFAULT_SHIFT_TYPES: Record<string, ShiftTypeConfig> = {
  morning: {
    label: 'Morning',
    defaultStart: '09:30',
    defaultEnd: '14:30',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '',
  },
  afternoon: {
    label: 'Afternoon',
    defaultStart: '12:00',
    defaultEnd: '18:00',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '',
  },
  evening: {
    label: 'Evening',
    defaultStart: '18:00',
    defaultEnd: '22:00',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '',
  },
  night: {
    label: 'Night',
    defaultStart: '22:00',
    defaultEnd: '06:00',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '',
  },
}

// Color options for shift type editor
export const SHIFT_COLOR_OPTIONS = [
  { value: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Yellow' },
  { value: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Blue' },
  { value: 'bg-green-100 text-green-800 border-green-200', label: 'Green' },
  { value: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Purple' },
  { value: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Pink' },
  { value: 'bg-red-100 text-red-800 border-red-200', label: 'Red' },
  { value: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Gray' },
] as const
