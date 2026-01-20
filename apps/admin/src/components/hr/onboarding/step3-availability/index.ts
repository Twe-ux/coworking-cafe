/**
 * Step 3 Availability Module
 *
 * Modular components for employee availability and weekly distribution
 */

export { AvailabilityTab } from './AvailabilityTab'
export { DayAvailability } from './DayAvailability'
export { DistributionTab } from './DistributionTab'
export { TimeSlotInput } from './TimeSlotInput'
export { WeeklyDistributionTable } from './WeeklyDistributionTable'
export { useAvailabilityForm } from './useAvailabilityForm'
export { DAYS, WEEKS } from './types'
export type {
  DayConfig,
  TimeSlotWithId,
  UseAvailabilityFormProps,
  UseAvailabilityFormReturn,
} from './types'
