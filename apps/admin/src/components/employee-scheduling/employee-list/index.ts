/**
 * Employee List Module - Modular Components
 *
 * This module provides a refactored employee list with separate components
 * for better maintainability and respect of file size limits (< 200 lines)
 */

export { EmployeeListMain } from './EmployeeListMain'
export { EmployeeCard } from './EmployeeCard'
export { EmployeeListFilters } from './EmployeeListFilters'
export { EmployeeListStats } from './EmployeeListStats'
export { EmployeeListGrid } from './EmployeeListGrid'
export { EmployeeListSkeleton } from './EmployeeListSkeleton'
export { useEmployeeListLogic } from './useEmployeeListLogic'

export * from './types'
export * from './utils'
