/**
 * Utility functions for shift form
 */

import type { ShiftFormData, FormErrors } from './types'

const EMPLOYEE_STORAGE_KEY = 'lastSelectedEmployeeId'

/**
 * Get persistent employee ID from localStorage
 */
export function getPersistentEmployeeId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(EMPLOYEE_STORAGE_KEY) || ''
  }
  return ''
}

/**
 * Save employee ID to localStorage
 */
export function savePersistentEmployeeId(employeeId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, employeeId)
  }
}

/**
 * Format date to YYYY-MM-DD in local timezone
 */
export function formatDateToLocalString(date: Date | string): string {
  if (typeof date === 'string') return date
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Validate shift form data
 */
export function validateShiftForm(dataToValidate: ShiftFormData): FormErrors {
  const newErrors: FormErrors = {}

  if (!dataToValidate.employeeId) {
    newErrors.employeeId = 'Veuillez selectionner un employe'
  }

  if (!dataToValidate.startTime) {
    newErrors.startTime = "L'heure de debut est requise"
  }

  if (!dataToValidate.endTime) {
    newErrors.endTime = "L'heure de fin est requise"
  }

  return newErrors
}

/**
 * Calculate shift duration from start and end times
 */
export function calculateShiftDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return ''

  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)

  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours > 0 ? `${diffHours.toFixed(1)} hours` : ''
}
