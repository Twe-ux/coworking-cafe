import type { Types } from 'mongoose'
import { objectIdToString } from './common'

/**
 * TimeEntry Mappers - Utilities for transforming TimeEntry documents
 */

/**
 * Interface for populated employee reference (for time entries)
 */
interface PopulatedEmployee {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  employeeRole?: string
}

/**
 * Interface for time entry documents
 */
interface TimeEntryDocument {
  _id: Types.ObjectId | string
  employeeId: PopulatedEmployee | Types.ObjectId | string
  date: string
  clockIn: string
  clockOut?: string | null
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: string
  errorMessage?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Mapped time entry for API response
 */
export interface MappedTimeEntry {
  id: string
  employeeId: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    employeeRole: string
  }
  date: string
  clockIn: string
  clockOut?: string | null
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: string
  errorMessage?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  currentDuration?: number
}

/**
 * Map a populated time entry document to API format
 *
 * @example
 * const entry = await TimeEntry.findById(id)
 *   .populate('employeeId', 'firstName lastName employeeRole')
 *   .lean()
 * const result = mapTimeEntryToApi(entry)
 */
export function mapTimeEntryToApi(
  entry: TimeEntryDocument | null
): MappedTimeEntry | null {
  if (!entry) return null

  const employeeData =
    typeof entry.employeeId === 'object' && 'firstName' in entry.employeeId
      ? (entry.employeeId as PopulatedEmployee)
      : null

  const employeeIdStr = employeeData
    ? objectIdToString(employeeData._id)
    : objectIdToString(entry.employeeId as Types.ObjectId | string)

  // Calculate current duration for active entries
  let currentDuration: number | undefined
  if (!entry.clockOut && entry.status === 'active') {
    currentDuration = Math.max(
      0,
      (new Date().getTime() - new Date(`${entry.date}T${entry.clockIn}`).getTime()) /
        (1000 * 60 * 60)
    )
  } else {
    currentDuration = entry.totalHours || 0
  }

  return {
    id: objectIdToString(entry._id),
    employeeId: employeeIdStr,
    employee: employeeData
      ? {
          id: objectIdToString(employeeData._id),
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          fullName: `${employeeData.firstName} ${employeeData.lastName}`,
          employeeRole: employeeData.employeeRole || '',
        }
      : undefined,
    date: entry.date,
    clockIn: entry.clockIn,
    clockOut: entry.clockOut,
    shiftNumber: entry.shiftNumber,
    totalHours: entry.totalHours,
    status: entry.status,
    hasError: entry.hasError,
    errorType: entry.errorType,
    errorMessage: entry.errorMessage,
    isActive: entry.isActive,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    currentDuration,
  }
}

/**
 * Map multiple time entries to API format
 */
export function mapTimeEntriesToApi(
  entries: TimeEntryDocument[]
): MappedTimeEntry[] {
  return entries.map((entry) => mapTimeEntryToApi(entry)!)
}
