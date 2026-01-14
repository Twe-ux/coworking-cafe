export interface TimeEntry {
  id: string
  employeeId: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    role: string
  }
  date: Date
  clockIn: Date
  clockOut?: Date | null
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY'
  errorMessage?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  currentDuration?: number
}

export interface TimeEntryFilter {
  employeeId?: string
  startDate?: Date
  endDate?: Date
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
  details?: any
  message?: string
}

export interface ClockInRequest {
  employeeId: string
  pin: string
  clockIn?: string
}

export interface VerifyPinRequest {
  employeeId: string
  pin: string
}

export const TIME_ENTRY_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  INVALID_PIN: 'INVALID_PIN',
  ALREADY_CLOCKED_IN: 'ALREADY_CLOCKED_IN',
  MAX_SHIFTS_EXCEEDED: 'MAX_SHIFTS_EXCEEDED',
} as const
