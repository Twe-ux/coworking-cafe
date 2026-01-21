/**
 * Mappers Index - Barrel export for all mapper utilities
 *
 * This file exports all mapper functions for easy import throughout the application.
 * Each mapper is organized by entity for better maintainability.
 *
 * @example
 * import { mapEmployeeToApi, mapShiftToApi } from '@/lib/mappers'
 */

// Common utilities
export { objectIdToString, mapDocumentToApi, mapDocumentsToApi } from './common'

// Employee mappers
export {
  mapPopulatedEmployee,
  mapEmployeeToApi,
  mapEmployeeToApiSummary,
  mapEmployeesToApi,
  type MappedEmployeeRef,
  type MappedEmployee,
} from './employee'

// Shift mappers
export { mapShiftToApi, mapShiftsToApi, type MappedShift } from './shift'

// Availability mappers
export {
  mapAvailabilityToApi,
  mapAvailabilitiesToApi,
  type MappedAvailability,
} from './availability'

// TimeEntry mappers
export {
  mapTimeEntryToApi,
  mapTimeEntriesToApi,
  type MappedTimeEntry,
} from './timeEntry'
