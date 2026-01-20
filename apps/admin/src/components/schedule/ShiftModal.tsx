/**
 * ShiftModal - Re-export for backward compatibility
 *
 * This component has been refactored into a modular structure.
 * See: /components/schedule/shift-modal/
 *
 * Structure:
 * - ShiftModal.tsx (main component, ~150 lines)
 * - types.ts (interfaces and constants)
 * - useShiftTypes.ts (shift types management hook)
 * - useShiftForm.ts (form state and handlers hook)
 * - DateDisplay.tsx (date display component)
 * - EmployeeSelector.tsx (employee selection component)
 * - ShiftTypeSelector.tsx (shift type selection with settings)
 * - TimeSelector.tsx (time input fields)
 * - DurationDisplay.tsx (duration calculation display)
 * - ShiftPreview.tsx (shift preview card)
 * - ShiftTypeEditorDialog.tsx (shift type editor modal)
 */

// Re-export everything for backward compatibility
export { ShiftModal } from './shift-modal'
export type { ShiftTypeConfig, ShiftModalProps, ShiftFormData } from './shift-modal'
export { DEFAULT_SHIFT_TYPES as SHIFT_TYPES } from './shift-modal'
