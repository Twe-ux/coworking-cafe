import type { Types } from 'mongoose'
import { objectIdToString } from './common'

/**
 * Employee Mappers - Utilities for transforming Employee documents
 */

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
 * Mapped employee reference for API response (used in shifts, time entries, etc.)
 */
export interface MappedEmployeeRef {
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
): MappedEmployeeRef | null {
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
 * Interface for employee documents (from lean() query)
 */
interface EmployeeDocument {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: Date | string
  placeOfBirth?: string
  address?: {
    street?: string
    postalCode?: string
    city?: string
  }
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: Date | string
  hireTime?: string
  endDate?: Date | string | null
  endContractReason?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  availability?: Record<string, unknown>
  onboardingStatus?: Record<string, unknown>
  workSchedule?: Record<string, unknown>
  bankDetails?: {
    iban?: string
    bic?: string
    bankName?: string
  }
  clockingCode?: string
  color?: string
  role?: string
  isActive?: boolean
  isDraft?: boolean
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Mapped employee for API response
 */
export interface MappedEmployee {
  id: string
  _id?: string
  firstName: string
  lastName: string
  fullName: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: Date | string
  placeOfBirth?: string
  address?: {
    street?: string
    postalCode?: string
    city?: string
  }
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: Date | string
  hireTime?: string
  endDate?: Date | string | null
  endContractReason?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  availability?: Record<string, unknown>
  onboardingStatus?: Record<string, unknown>
  workSchedule?: Record<string, unknown>
  bankDetails?: {
    iban?: string
    bic?: string
    bankName?: string
  }
  clockingCode?: string
  color?: string
  role?: string
  isActive?: boolean
  isDraft?: boolean
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Map an employee document to API format (full details)
 *
 * @example
 * const employee = await Employee.findById(id).lean()
 * const result = mapEmployeeToApi(employee)
 */
export function mapEmployeeToApi(
  employee: EmployeeDocument | null
): MappedEmployee | null {
  if (!employee) return null

  const id = objectIdToString(employee._id)

  return {
    id,
    _id: id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    phone: employee.phone,
    dateOfBirth: employee.dateOfBirth,
    placeOfBirth: employee.placeOfBirth,
    address: employee.address,
    socialSecurityNumber: employee.socialSecurityNumber,
    contractType: employee.contractType,
    contractualHours: employee.contractualHours,
    hireDate: employee.hireDate,
    hireTime: employee.hireTime,
    endDate: employee.endDate,
    endContractReason: employee.endContractReason,
    level: employee.level,
    step: employee.step,
    hourlyRate: employee.hourlyRate,
    monthlySalary: employee.monthlySalary,
    employeeRole: employee.employeeRole,
    availability: employee.availability,
    onboardingStatus: employee.onboardingStatus,
    workSchedule: employee.workSchedule,
    bankDetails: employee.bankDetails,
    clockingCode: employee.clockingCode,
    color: employee.color,
    role: employee.role,
    isActive: employee.isActive,
    isDraft: employee.isDraft,
    deletedAt: employee.deletedAt,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  }
}

/**
 * Map an employee document to API format (summary for lists)
 */
export function mapEmployeeToApiSummary(
  employee: EmployeeDocument | null
): Pick<
  MappedEmployee,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'employeeRole'
  | 'color'
  | 'isActive'
  | 'clockingCode'
> | null {
  if (!employee) return null

  const id = objectIdToString(employee._id)

  return {
    id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    employeeRole: employee.employeeRole,
    color: employee.color,
    isActive: employee.isActive,
    clockingCode: employee.clockingCode,
  }
}

/**
 * Map multiple employees to API format
 */
export function mapEmployeesToApi(
  employees: EmployeeDocument[]
): MappedEmployee[] {
  return employees.map((employee) => mapEmployeeToApi(employee)!)
}
