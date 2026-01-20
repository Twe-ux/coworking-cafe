'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Shift, CreateShiftInput } from '@/types/shift'
import type { ShiftFormData, FormErrors, ShiftTypeConfig } from './types'
import {
  getPersistentEmployeeId,
  savePersistentEmployeeId,
  formatDateToLocalString,
  validateShiftForm,
  calculateShiftDuration,
} from './formUtils'

interface UseShiftFormProps {
  existingShift?: Shift | null
  selectedDate: Date
  onSave: (data: CreateShiftInput) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (id: string, data: Partial<Shift>) => Promise<{ success: boolean; error?: string }>
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
  open: boolean
  shiftTypes: Record<string, ShiftTypeConfig>
}

interface UseShiftFormReturn {
  formData: ShiftFormData
  errors: FormErrors
  isSubmitting: boolean
  persistentEmployeeId: string
  isEditing: boolean
  setFormData: React.Dispatch<React.SetStateAction<ShiftFormData>>
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  handleEmployeeSelect: (employeeId: string) => void
  handleShiftTypeChange: (type: string) => void
  handleSubmit: () => Promise<void>
  handleDelete: () => Promise<void>
  calculateDuration: () => string
  formatDateToLocalString: (date: Date | string) => string
}

/**
 * Hook managing shift form state and operations
 */
export function useShiftForm({
  existingShift,
  selectedDate,
  onSave,
  onUpdate,
  onDelete,
  onClose,
  open,
  shiftTypes,
}: UseShiftFormProps): UseShiftFormReturn {
  const isEditing = !!existingShift

  const [persistentEmployeeId, setPersistentEmployeeId] = useState<string>(getPersistentEmployeeId)

  const [formData, setFormData] = useState<ShiftFormData>({
    employeeId: existingShift?.employeeId || persistentEmployeeId || '',
    date: existingShift?.date || selectedDate,
    startTime: existingShift?.startTime || '09:00',
    endTime: existingShift?.endTime || '17:00',
    type: existingShift?.type || 'morning',
    location: existingShift?.location || '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or shift changes
  useEffect(() => {
    if (open) {
      const defaultEmployeeId = existingShift?.employeeId || persistentEmployeeId || ''
      setFormData({
        employeeId: defaultEmployeeId,
        date: existingShift?.date || selectedDate,
        startTime: existingShift?.startTime || '09:00',
        endTime: existingShift?.endTime || '17:00',
        type: existingShift?.type || 'morning',
        location: existingShift?.location || '',
      })
      setErrors({})
    }
  }, [open, existingShift, selectedDate, persistentEmployeeId])

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    savePersistentEmployeeId(employeeId)
    setPersistentEmployeeId(employeeId)
    setFormData((prev) => ({ ...prev, employeeId }))
  }, [])

  const handleShiftTypeChange = useCallback((type: string) => {
    const shiftType = shiftTypes[type]
    if (!shiftType) return

    setFormData((prev) => ({
      ...prev,
      type,
      startTime: shiftType.defaultStart,
      endTime: shiftType.defaultEnd,
    }))
  }, [shiftTypes])

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateShiftForm(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const shiftData: CreateShiftInput = {
        employeeId: formData.employeeId,
        date: formatDateToLocalString(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        location: formData.location?.trim() || undefined,
      }

      const result = isEditing && existingShift && onUpdate
        ? await onUpdate(existingShift.id, shiftData)
        : await onSave(shiftData)

      if (result.success) {
        onClose()
      } else {
        setErrors({ submit: result.error || 'Une erreur est survenue' })
      }
    } catch (error) {
      console.error('Error saving shift:', error)
      setErrors({ submit: 'Erreur de connexion au serveur' })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isEditing, existingShift, onUpdate, onSave, onClose])

  const handleDelete = useCallback(async () => {
    if (!existingShift || !onDelete) return
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce creneau ?')) return

    setIsSubmitting(true)
    try {
      const result = await onDelete(existingShift.id)
      if (result.success) {
        onClose()
      } else {
        setErrors({ submit: result.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      setErrors({ submit: 'Erreur de connexion au serveur' })
    } finally {
      setIsSubmitting(false)
    }
  }, [existingShift, onClose, onDelete])

  const calculateDuration = useCallback(
    () => calculateShiftDuration(formData.startTime, formData.endTime),
    [formData.startTime, formData.endTime]
  )

  return {
    formData,
    errors,
    isSubmitting,
    persistentEmployeeId,
    isEditing,
    setFormData,
    setErrors,
    handleEmployeeSelect,
    handleShiftTypeChange,
    handleSubmit,
    handleDelete,
    calculateDuration,
    formatDateToLocalString,
  }
}
