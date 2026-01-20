// Main export
export { ShiftModal } from './ShiftModal'

// Types
export type { ShiftTypeConfig, ShiftModalProps, ShiftFormData, FormErrors } from './types'
export { DEFAULT_SHIFT_TYPES, SHIFT_COLOR_OPTIONS } from './types'

// Hooks
export { useShiftTypes } from './useShiftTypes'
export { useShiftForm } from './useShiftForm'

// Utilities
export * from './formUtils'

// Sub-components (if needed externally)
export { DateDisplay } from './DateDisplay'
export { EmployeeSelector } from './EmployeeSelector'
export { ShiftTypeSelector } from './ShiftTypeSelector'
export { TimeSelector } from './TimeSelector'
export { DurationDisplay } from './DurationDisplay'
export { ShiftPreview } from './ShiftPreview'
export { ShiftTypeEditorDialog } from './ShiftTypeEditorDialog'
