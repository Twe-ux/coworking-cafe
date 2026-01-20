/**
 * Hook for managing shift form data state
 */

import { useState, useEffect } from 'react'
import type { Shift, ShiftFormData } from '../types'
import { STORAGE_KEYS } from '../constants'

interface UseShiftFormDataOptions {
  selectedDate: Date
  existingShift: Shift | null | undefined
  open: boolean
  persistentEmployeeId: string
}

/**
 * Normalize date to avoid timezone issues
 */
function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Get persistent employee ID from localStorage
 */
export function getPersistentEmployeeId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEYS.LAST_SELECTED_EMPLOYEE) || ''
}

/**
 * Save employee ID to localStorage
 */
export function savePersistentEmployeeId(employeeId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAST_SELECTED_EMPLOYEE, employeeId)
  }
}

/**
 * Calculate shift duration in hours
 */
export function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return ''

  const start = new Date(`2000-01-01 ${startTime}`)
  let end = new Date(`2000-01-01 ${endTime}`)

  // Handle overnight shifts
  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours > 0 ? `${diffHours.toFixed(1)} hours` : ''
}

function getInitialFormData(
  existingShift: Shift | null | undefined,
  selectedDate: Date,
  persistentEmployeeId: string
): ShiftFormData {
  return {
    employeeId: existingShift?.employeeId || persistentEmployeeId || '',
    date: normalizeDate(
      existingShift?.date
        ? typeof existingShift.date === 'string'
          ? new Date(existingShift.date)
          : existingShift.date
        : selectedDate || new Date()
    ),
    startTime: existingShift?.startTime || '09:00',
    endTime: existingShift?.endTime || '17:00',
    type: existingShift?.type || 'morning',
    location: existingShift?.location || '',
  }
}

export function useShiftFormData({
  selectedDate,
  existingShift,
  open,
  persistentEmployeeId,
}: UseShiftFormDataOptions) {
  const [formData, setFormData] = useState<ShiftFormData>(() =>
    getInitialFormData(existingShift, selectedDate, persistentEmployeeId)
  )

  // Reset form when dialog opens/closes or shift changes
  useEffect(() => {
    if (open) {
      const defaultEmployeeId = existingShift?.employeeId || persistentEmployeeId || ''
      setFormData({
        employeeId: defaultEmployeeId,
        date: normalizeDate(
          existingShift?.date
            ? typeof existingShift.date === 'string'
              ? new Date(existingShift.date)
              : existingShift.date
            : selectedDate || new Date()
        ),
        startTime: existingShift?.startTime || '09:00',
        endTime: existingShift?.endTime || '17:00',
        type: existingShift?.type || 'morning',
        location: existingShift?.location || '',
      })
    }
  }, [open, existingShift, selectedDate, persistentEmployeeId])

  return { formData, setFormData }
}
