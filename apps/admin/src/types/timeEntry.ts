export interface TimeEntry {
  id: string
  employeeId: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    employeeRole: string
  }
  date: string // Format "YYYY-MM-DD"
  clockIn: string // Format "HH:mm"
  clockOut?: string | null // Format "HH:mm"
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY'
  errorMessage?: string
  isOutOfSchedule?: boolean // True if clocked in/out outside scheduled shift (±15min)
  justificationNote?: string // Note explaining why clocked in/out outside schedule
  justificationRead?: boolean // True if admin has read and acknowledged the justification
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  currentDuration?: number
}

export interface TimeEntryFilter {
  employeeId?: string
  startDate?: string // Format "YYYY-MM-DD"
  endDate?: string // Format "YYYY-MM-DD"
  status?: 'active' | 'completed'
  shiftNumber?: 1 | 2
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string | string[] | Record<string, string> | Record<string, unknown>
  message?: string
}

export interface ClockInRequest {
  employeeId: string
  pin: string
  clockIn?: string
}

export interface ClockOutRequest {
  employeeId: string
  pin: string
  clockOut?: string
  timeEntryId?: string
}

export interface VerifyPinRequest {
  employeeId: string
  pin: string
}

export interface TimeEntryUpdate {
  clockIn?: string
  clockOut?: string | null
  totalHours?: number
  status?: 'active' | 'completed'
  justificationNote?: string
}

export interface EmployeeTimeReport {
  employeeId: string
  employee: {
    firstName: string
    lastName: string
    fullName: string
    role: string
  }
  shifts: Array<{
    shiftNumber: 1 | 2
    clockIn: Date
    clockOut?: Date | null
    totalHours?: number
    status: 'active' | 'completed'
  }>
  totalHours: number
  activeShifts: number
}

export interface DailyTimeReport {
  date: Date
  employees: EmployeeTimeReport[]
  totalActiveShifts: number
  totalCompletedShifts: number
  totalHoursWorked: number
}

export interface TimeTrackingStats {
  totalHours: number
  totalShifts: number
  averageHoursPerShift: number
  activeShifts: number
  completedShifts: number
}

export type TimeEntryStatus = 'active' | 'completed'
export type ShiftNumber = 1 | 2

export const TIME_ENTRY_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  INVALID_PIN: 'INVALID_PIN',
  ALREADY_CLOCKED_IN: 'ALREADY_CLOCKED_IN',
  NOT_CLOCKED_IN: 'NOT_CLOCKED_IN',
  MAX_SHIFTS_EXCEEDED: 'MAX_SHIFTS_EXCEEDED',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  SHIFT_ALREADY_COMPLETED: 'SHIFT_ALREADY_COMPLETED',
  TIME_ENTRY_NOT_FOUND: 'TIME_ENTRY_NOT_FOUND',
} as const

export type TimeEntryErrorCode = typeof TIME_ENTRY_ERRORS[keyof typeof TIME_ENTRY_ERRORS]
