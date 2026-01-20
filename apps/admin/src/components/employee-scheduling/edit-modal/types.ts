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

export interface EmployeeFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: string
  startDate?: string
  pin?: string
  submit?: string
}
