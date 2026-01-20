/**
 * Types for ShiftAssignment component
 * Following conventions from /types/hr.ts
 */

import type { Employee } from '@/hooks/useEmployees'
import type { Shift } from '@/hooks/useShifts'

// Re-export for convenience
export type { Employee, Shift }

/**
 * Shift type configuration for scheduling
 */
export interface ShiftTypeConfig {
  label: string
  defaultStart: string
  defaultEnd: string
  color: string
  icon: string
}

/**
 * Form data for creating/editing a shift
 */
export interface ShiftFormData {
  employeeId: string
  date: Date
  startTime: string
  endTime: string
  type: string
  location: string
}

/**
 * Data structure for saving a new shift
 */
export interface ShiftSaveData {
  employeeId: string
  date: Date
  startTime: string
  endTime: string
  type: string
  location?: string
}

/**
 * Form validation errors
 */
export interface ShiftFormErrors {
  employeeId?: string
  startTime?: string
  endTime?: string
}

/**
 * New shift type being created
 */
export interface NewShiftTypeData {
  label: string
  defaultStart: string
  defaultEnd: string
  color: string
  icon: string
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Main ShiftAssignment modal props
 */
export interface ShiftAssignmentProps {
  employees: Employee[]
  selectedDate?: Date
  existingShift?: Shift | null
  onSave: (shift: ShiftSaveData) => void
  onUpdate: (shiftId: string, shift: Partial<Shift>) => void
  onDelete: (shiftId: string) => void
  onClose: () => void
  open: boolean
  className?: string
}

/**
 * Props for EmployeeSelector component
 */
export interface EmployeeSelectorProps {
  employees: Employee[]
  selectedEmployeeId: string
  persistentEmployeeId: string
  isEditing: boolean
  error?: string
  onSelect: (employeeId: string) => void
}

/**
 * Props for ShiftTypeSelector component
 */
export interface ShiftTypeSelectorProps {
  shiftTypes: Record<string, ShiftTypeConfig>
  selectedType: string
  onTypeChange: (type: string) => void
  onShowSettings: () => void
  showSettingsButton?: boolean
}

/**
 * Props for TimeSelector component
 */
export interface TimeSelectorProps {
  startTime: string
  endTime: string
  startError?: string
  endError?: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

/**
 * Props for ShiftPreview component
 */
export interface ShiftPreviewProps {
  employee: Employee
  shiftType: ShiftTypeConfig | undefined
  formData: ShiftFormData
  duration: string
}

/**
 * Props for ShiftTypeSettings component
 */
export interface ShiftTypeSettingsProps {
  shiftTypes: Record<string, ShiftTypeConfig>
  onEdit: (key: string) => void
  onDelete: (key: string) => void
  onAddNew: () => void
}

/**
 * Props for ShiftTypeEditor dialog
 */
export interface ShiftTypeEditorProps {
  open: boolean
  onClose: () => void
  editingKey: string | null
  shiftTypes: Record<string, ShiftTypeConfig>
  newShiftType: NewShiftTypeData
  onSave: () => void
  onUpdateShiftType: (key: string, field: keyof ShiftTypeConfig, value: string) => void
  onUpdateNewShiftType: (field: keyof NewShiftTypeData, value: string) => void
}

/**
 * Props for DateDisplay component
 */
export interface DateDisplayProps {
  date: Date
}

/**
 * Props for DurationDisplay component
 */
export interface DurationDisplayProps {
  duration: string
}

/**
 * Props for DialogActions component
 */
export interface DialogActionsProps {
  isEditing: boolean
  isSubmitting: boolean
  onDelete: () => void
  onClose: () => void
  onSubmit: () => void
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useShiftAssignment hook
 */
export interface UseShiftAssignmentReturn {
  // Form state
  formData: ShiftFormData
  errors: ShiftFormErrors
  isSubmitting: boolean
  isEditing: boolean

  // Employee persistence
  persistentEmployeeId: string

  // Handlers
  handleEmployeeSelect: (employeeId: string) => void
  handleShiftTypeChange: (type: string) => void
  handleStartTimeChange: (time: string) => void
  handleEndTimeChange: (time: string) => void
  handleSubmit: () => Promise<void>
  handleDelete: () => void

  // Computed
  selectedEmployee: Employee | undefined
  duration: string
}

/**
 * Return type for useShiftTypes hook
 */
export interface UseShiftTypesReturn {
  // State
  shiftTypes: Record<string, ShiftTypeConfig>
  showSettings: boolean
  editingShiftType: string | null
  newShiftType: NewShiftTypeData

  // Handlers
  setShowSettings: (show: boolean) => void
  setEditingShiftType: (key: string | null) => void
  handleDeleteShiftType: (key: string) => void
  handleSaveShiftType: () => void
  updateShiftType: (key: string, field: keyof ShiftTypeConfig, value: string) => void
  updateNewShiftType: (field: keyof NewShiftTypeData, value: string) => void
}

// ============================================================================
// Color Theme Options
// ============================================================================

/**
 * Available color themes for shift types
 */
export interface ColorThemeOption {
  value: string
  label: string
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { value: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Yellow' },
  { value: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Blue' },
  { value: 'bg-green-100 text-green-800 border-green-200', label: 'Green' },
  { value: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Purple' },
  { value: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Pink' },
  { value: 'bg-red-100 text-red-800 border-red-200', label: 'Red' },
  { value: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Gray' },
]

/**
 * Available emoji icons for shift types
 */
export const SHIFT_ICONS = ['morning', 'sun', 'evening', 'night', 'zap', 'briefcase', 'building', 'tool'] as const
export const EMOJI_ICONS = ['sunrise', 'sun', 'sunset', 'moon', 'bolt', 'case', 'office', 'wrench'] as const
