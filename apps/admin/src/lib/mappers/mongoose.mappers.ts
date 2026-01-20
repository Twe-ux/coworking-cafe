import type { Types, Document } from 'mongoose'

/**
 * Mongoose Mappers - Utilities for transforming Mongoose documents to API responses
 *
 * These utilities help convert Mongoose ObjectId and Documents to plain objects
 * with string IDs for API responses, eliminating the need for `as any` casts.
 */

/**
 * Type guard to check if a value is a Mongoose ObjectId
 */
function isObjectId(value: unknown): value is Types.ObjectId {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toString' in value &&
    '_bsontype' in value &&
    (value as { _bsontype: string })._bsontype === 'ObjectId'
  )
}

/**
 * Convert a Mongoose ObjectId to string
 * Returns the string representation if it's an ObjectId, otherwise returns the value as string
 */
export function objectIdToString(
  id: Types.ObjectId | string | null | undefined
): string {
  if (id === null || id === undefined) {
    return ''
  }
  if (isObjectId(id)) {
    return id.toString()
  }
  return String(id)
}

/**
 * Base interface for documents with _id
 */
interface WithId {
  _id: Types.ObjectId | string
}

/**
 * Transform a single Mongoose document to a plain object with string id
 * Replaces _id with id as string
 *
 * @example
 * const doc = await Model.findById(id).lean()
 * const result = mapDocumentToApi(doc)
 * // { id: '...', ...rest }
 */
export function mapDocumentToApi<T extends WithId>(
  doc: T | null
): (Omit<T, '_id'> & { id: string }) | null {
  if (!doc) return null

  const { _id, ...rest } = doc
  return {
    id: objectIdToString(_id),
    ...rest,
  } as Omit<T, '_id'> & { id: string }
}

/**
 * Transform an array of Mongoose documents to plain objects with string ids
 *
 * @example
 * const docs = await Model.find().lean()
 * const results = mapDocumentsToApi(docs)
 */
export function mapDocumentsToApi<T extends WithId>(
  docs: T[]
): Array<Omit<T, '_id'> & { id: string }> {
  return docs.map((doc) => mapDocumentToApi(doc)!)
}

/**
 * Interface for populated employee reference
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
 * Mapped employee for API response
 */
export interface MappedEmployee {
  id: string
  firstName: string
  lastName: string
  fullName?: string
  role?: string
  color?: string
}

/**
 * Map a populated employee reference to API format
 *
 * @example
 * const shift = await Shift.findById(id).populate('employeeId').lean()
 * const employee = mapPopulatedEmployee(shift.employeeId)
 */
export function mapPopulatedEmployee(
  employee: PopulatedEmployee | null | undefined
): MappedEmployee | null {
  if (!employee) return null

  return {
    id: objectIdToString(employee._id),
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName: employee.fullName,
    role: employee.employeeRole,
    color: employee.color,
  }
}

/**
 * Interface for shift documents
 */
interface ShiftDocument extends WithId {
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
  employee: MappedEmployee | null
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

/**
 * Interface for availability documents
 */
interface AvailabilityDocument extends WithId {
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
  employee: MappedEmployee | null
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
