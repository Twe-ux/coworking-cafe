/**
 * Hook for managing shift assignment form state and logic
 */

import { useState, useCallback } from 'react'
import type {
  Employee,
  Shift,
  ShiftFormData,
  ShiftFormErrors,
  ShiftTypeConfig,
  UseShiftAssignmentReturn,
} from '../types'
import {
  getPersistentEmployeeId,
  savePersistentEmployeeId,
  calculateDuration,
  useShiftFormData,
} from './useShiftFormData'

interface UseShiftAssignmentOptions {
  employees: Employee[]
  selectedDate: Date
  existingShift: Shift | null | undefined
  shiftTypes: Record<string, ShiftTypeConfig>
  open: boolean
  onSave: (shift: {
    employeeId: string
    date: Date | string
    startTime: string
    endTime: string
    type: string
    location?: string
  }) => void
  onUpdate: (shiftId: string, shift: Partial<Shift>) => void
  onDelete: (shiftId: string) => void
  onClose: () => void
}

function validateForm(data: ShiftFormData): ShiftFormErrors {
  const errors: ShiftFormErrors = {}

  if (!data.employeeId) {
    errors.employeeId = 'Please select an employee'
  }
  if (!data.startTime) {
    errors.startTime = 'Start time is required'
  }
  if (!data.endTime) {
    errors.endTime = 'End time is required'
  }

  return errors
}

export function useShiftAssignment({
  employees,
  selectedDate,
  existingShift,
  shiftTypes,
  open,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}: UseShiftAssignmentOptions): UseShiftAssignmentReturn {
  const [persistentEmployeeId, setPersistentEmployeeId] = useState<string>(getPersistentEmployeeId)
  const [errors, setErrors] = useState<ShiftFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { formData, setFormData } = useShiftFormData({
    selectedDate,
    existingShift,
    open,
    persistentEmployeeId,
  })

  const isEditing = !!existingShift

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    savePersistentEmployeeId(employeeId)
    setPersistentEmployeeId(employeeId)
    setFormData((prev) => ({ ...prev, employeeId }))
  }, [setFormData])

  const submitWithData = useCallback(
    async (dataToSubmit: ShiftFormData) => {
      const validationErrors = validateForm(dataToSubmit)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) return

      setIsSubmitting(true)
      try {
        const shiftData = {
          employeeId: dataToSubmit.employeeId,
          date: typeof dataToSubmit.date === 'string' ? dataToSubmit.date : dataToSubmit.date.toISOString().split('T')[0],
          startTime: dataToSubmit.startTime,
          endTime: dataToSubmit.endTime,
          type: dataToSubmit.type,
          location: dataToSubmit.location || undefined,
        }

        if (isEditing && existingShift) {
          onUpdate(existingShift.id, shiftData)
        } else {
          onSave(shiftData)
        }

        onClose()
      } catch (error) {
        console.error('Error saving shift:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isEditing, existingShift, onSave, onUpdate, onClose]
  )

  const handleShiftTypeChange = useCallback(
    (type: string) => {
      const shiftType = shiftTypes[type]
      if (!shiftType) return

      const newFormData = {
        ...formData,
        type,
        startTime: shiftType.defaultStart,
        endTime: shiftType.defaultEnd,
      }
      setFormData(newFormData)

      // Auto-submit if employee is selected and not editing
      if (newFormData.employeeId?.trim() && !isEditing) {
        setTimeout(() => submitWithData(newFormData), 100)
      }
    },
    [formData, shiftTypes, isEditing, setFormData, submitWithData]
  )

  const handleStartTimeChange = useCallback(
    (startTime: string) => setFormData((prev) => ({ ...prev, startTime })),
    [setFormData]
  )

  const handleEndTimeChange = useCallback(
    (endTime: string) => setFormData((prev) => ({ ...prev, endTime })),
    [setFormData]
  )

  const handleSubmit = useCallback(
    () => submitWithData(formData),
    [submitWithData, formData]
  )

  const handleDelete = useCallback(async () => {
    if (!existingShift) return

    // Note: This requires async confirm dialog integration
    // For now, keeping synchronous check until ConfirmDialog is integrated at component level
    const confirmed = window.confirm('Are you sure you want to delete this shift?')
    if (confirmed) {
      onDelete(existingShift.id)
      onClose()
    }
  }, [existingShift, onDelete, onClose])

  const selectedEmployee = employees.find((emp) => emp.id === formData.employeeId)
  const duration = calculateDuration(formData.startTime, formData.endTime)

  return {
    formData,
    errors,
    isSubmitting,
    isEditing,
    persistentEmployeeId,
    handleEmployeeSelect,
    handleShiftTypeChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleSubmit,
    handleDelete,
    selectedEmployee,
    duration,
  }
}
