import type { Types } from 'mongoose'
import { objectIdToString } from './common'
import { mapPopulatedEmployee, type MappedEmployeeRef } from './employee'

/**
 * Availability Mappers - Utilities for transforming Availability documents
 */

/**
 * Interface for populated employee reference (re-exported from employee.ts)
 */
interface PopulatedEmployee {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  fullName?: string
  employeeRole?: string
  color?: string
}

/**
 * Interface for availability documents
 */
interface AvailabilityDocument {
  _id: Types.ObjectId | string
  employeeId: PopulatedEmployee | Types.ObjectId | string
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  effectiveFrom?: Date | string
  effectiveUntil?: Date | string
  notes?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Mapped availability for API response
 */
export interface MappedAvailability {
  id: string
  employeeId: string
  employee: MappedEmployeeRef | null
  dayOfWeek: number
  dayOfWeekLabel: string
  startTime: string
  endTime: string
  timeRange: string
  isRecurring: boolean
  effectiveFrom?: Date | string
  effectiveUntil?: Date | string
  notes?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Get day of week label
 */
function getDayLabel(day: number): string {
  const days = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ]
  return days[day] || ''
}

/**
 * Map an availability document to API format
 */
export function mapAvailabilityToApi(
  availability: AvailabilityDocument | null
): MappedAvailability | null {
  if (!availability) return null

  const employeeData =
    typeof availability.employeeId === 'object' &&
    'firstName' in availability.employeeId
      ? (availability.employeeId as PopulatedEmployee)
      : null

  const employeeIdStr = employeeData
    ? objectIdToString(employeeData._id)
    : objectIdToString(availability.employeeId as Types.ObjectId | string)

  return {
    id: objectIdToString(availability._id),
    employeeId: employeeIdStr,
    employee: mapPopulatedEmployee(employeeData),
    dayOfWeek: availability.dayOfWeek,
    dayOfWeekLabel: getDayLabel(availability.dayOfWeek),
    startTime: availability.startTime,
    endTime: availability.endTime,
    timeRange: `${availability.startTime} - ${availability.endTime}`,
    isRecurring: availability.isRecurring,
    effectiveFrom: availability.effectiveFrom,
    effectiveUntil: availability.effectiveUntil,
    notes: availability.notes,
    isActive: availability.isActive,
    createdAt: availability.createdAt,
    updatedAt: availability.updatedAt,
  }
}

/**
 * Map multiple availabilities to API format
 */
export function mapAvailabilitiesToApi(
  availabilities: AvailabilityDocument[]
): MappedAvailability[] {
  return availabilities.map((a) => mapAvailabilityToApi(a)!)
}
