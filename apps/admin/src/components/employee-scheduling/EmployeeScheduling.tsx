/**
 * EmployeeScheduling - Re-export for backward compatibility
 *
 * This component has been refactored into a modular structure.
 * See: /components/employee-scheduling/scheduling/
 *
 * Structure:
 * - EmployeeScheduling.tsx (main component, ~80 lines)
 * - types.ts (interfaces and constants)
 * - utils.ts (utility functions)
 * - useScheduleData.ts (schedule data operations hook)
 * - useTimeEntries.ts (time entries fetching hook)
 * - WeekCard.tsx (week schedule card)
 * - StaffColumn.tsx (employee names column)
 * - DayCell.tsx (single day cell)
 * - ShiftBadge.tsx (shift time badge)
 * - TimeTrackingSection.tsx (time tracking cards)
 * - EmptyState.tsx (empty/fallback states)
 */

// Re-export for backward compatibility
export { EmployeeScheduling, EmployeeScheduling as default } from './scheduling'
export type { EmployeeSchedulingProps } from './scheduling'
export { SHIFT_TYPES } from './scheduling'
