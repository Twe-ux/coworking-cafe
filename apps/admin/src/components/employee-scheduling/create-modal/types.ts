export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  color: string
  startDate: string
  pin: string
}

export interface FormErrors {
  [key: string]: string
}

export interface ServerError {
  success: boolean
  error?: string
  details?: string[]
  data?: unknown
}
