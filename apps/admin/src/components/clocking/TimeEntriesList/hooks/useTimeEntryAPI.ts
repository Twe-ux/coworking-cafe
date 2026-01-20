import { useCallback, useState } from 'react'
import type { TimeEntry, NewShiftData } from '../types'

interface UseTimeEntryAPIReturn {
  // Delete
  handleDeleteShift: (shiftId: string, onSuccess: () => Promise<void>) => Promise<void>

  // Create
  isCreatingShift: boolean
  handleCreateShift: (
    newShift: NewShiftData,
    onSuccess: () => Promise<void>
  ) => Promise<boolean>

  // Update
  isSaving: boolean
  handleUpdateTimeEntry: (
    entryId: string,
    field: 'clockIn' | 'clockOut' | 'date',
    value: string,
    onSuccess: () => Promise<void>
  ) => Promise<boolean>
}

export function useTimeEntryAPI(): UseTimeEntryAPIReturn {
  const [isCreatingShift, setIsCreatingShift] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Delete shift
  const handleDeleteShift = useCallback(
    async (shiftId: string, onSuccess: () => Promise<void>) => {
      if (!confirm('Etes-vous sur de vouloir supprimer ce shift ?')) return

      try {
        const response = await fetch(`/api/time-entries/${shiftId}`, {
          method: 'DELETE',
        })
        const result = await response.json()

        if (result.success) {
          await onSuccess()
        } else {
          alert(result.error || 'Erreur lors de la suppression du shift')
        }
      } catch (error) {
        console.error('Error deleting shift:', error)
        alert('Erreur lors de la suppression du shift')
      }
    },
    []
  )

  // Create shift
  const handleCreateShift = useCallback(
    async (
      newShift: NewShiftData,
      onSuccess: () => Promise<void>
    ): Promise<boolean> => {
      if (!newShift.employeeId || !newShift.date || !newShift.clockIn) {
        alert('Veuillez remplir tous les champs obligatoires')
        return false
      }

      setIsCreatingShift(true)
      try {
        const shiftData = {
          employeeId: newShift.employeeId,
          date: newShift.date,
          clockIn: newShift.clockIn,
          clockOut: newShift.clockOut || null,
          status: newShift.clockOut ? 'completed' : 'active',
        }

        const response = await fetch('/api/time-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shiftData),
        })

        const result = await response.json()

        if (result.success) {
          await onSuccess()
          return true
        } else {
          alert(result.error || 'Erreur lors de la creation du shift')
          return false
        }
      } catch (error) {
        console.error('Error creating shift:', error)
        alert('Erreur lors de la creation du shift')
        return false
      } finally {
        setIsCreatingShift(false)
      }
    },
    []
  )

  // Update time entry
  const handleUpdateTimeEntry = useCallback(
    async (
      entryId: string,
      field: 'clockIn' | 'clockOut' | 'date',
      value: string,
      onSuccess: () => Promise<void>
    ): Promise<boolean> => {
      setIsSaving(true)
      try {
        const updateData: Record<string, string> = { [field]: value }

        const response = await fetch(`/api/time-entries/${entryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (response.ok) {
          await onSuccess()
          return true
        } else {
          console.error('Error updating time entry')
          return false
        }
      } catch (error) {
        console.error('Error:', error)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  return {
    handleDeleteShift,
    isCreatingShift,
    handleCreateShift,
    isSaving,
    handleUpdateTimeEntry,
  }
}
