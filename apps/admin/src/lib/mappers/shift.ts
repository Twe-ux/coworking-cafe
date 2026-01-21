import type { Types } from 'mongoose'
import { objectIdToString } from './common'
import { mapPopulatedEmployee, type MappedEmployeeRef } from './employee'

/**
 * Shift Mappers - Utilities for transforming Shift documents
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
 * Interface for shift documents
 */
interface ShiftDocument {
  _id: Types.ObjectId | string
  employeeId: PopulatedEmployee | Types.ObjectId | string
  date: Date | string
  startTime: string
  endTime: string
  type: string
  location?: string
  notes?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Mapped shift for API response
 */
export interface MappedShift {
  id: string
  employeeId: string
  employee: MappedEmployeeRef | null
  date: Date | string
  startTime: string
  endTime: string
  type: string
  location?: string
  notes?: string
  isActive: boolean
  timeRange: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Map a populated shift document to API format
 *
 * @example
 * const shift = await Shift.findById(id)
 *   .populate('employeeId', 'firstName lastName fullName employeeRole color')
 *   .lean()
 * const result = mapShiftToApi(shift)
 */
export function mapShiftToApi(shift: ShiftDocument | null): MappedShift | null {
  if (!shift) return null

  const employeeData =
    typeof shift.employeeId === 'object' && 'firstName' in shift.employeeId
      ? (shift.employeeId as PopulatedEmployee)
      : null

  const employeeIdStr = employeeData
    ? objectIdToString(employeeData._id)
    : objectIdToString(shift.employeeId as Types.ObjectId | string)

  return {
    id: objectIdToString(shift._id),
    employeeId: employeeIdStr,
    employee: mapPopulatedEmployee(employeeData),
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    type: shift.type,
    location: shift.location,
    notes: shift.notes,
    isActive: shift.isActive,
    timeRange: `${shift.startTime} - ${shift.endTime}`,
    createdAt: shift.createdAt,
    updatedAt: shift.updatedAt,
  }
}

/**
 * Map multiple shifts to API format
 */
export function mapShiftsToApi(shifts: ShiftDocument[]): MappedShift[] {
  return shifts.map((shift) => mapShiftToApi(shift)!)
}
