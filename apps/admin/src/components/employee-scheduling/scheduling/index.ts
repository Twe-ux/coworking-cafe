// Main export
export { EmployeeScheduling } from './EmployeeScheduling'

// Types
export type {
  EmployeeSchedulingProps,
  WeekData,
  PositionedShifts,
  OrganizedShifts,
  ViewMode,
} from './types'
export { SHIFT_TYPES, DAYS_OF_WEEK, DEFAULT_EMPLOYEES } from './types'

// Hooks
export { useScheduleData } from './useScheduleData'
export { useTimeEntries } from './useTimeEntries'

// Components
export { WeekCard } from './WeekCard'
export { StaffColumn } from './StaffColumn'
export { DayCell } from './DayCell'
export { ShiftBadge } from './ShiftBadge'
export { TimeTrackingSection } from './TimeTrackingSection'
export { EmptyState, NonStaffFallback } from './EmptyState'

// Utilities
export * from './utils'
