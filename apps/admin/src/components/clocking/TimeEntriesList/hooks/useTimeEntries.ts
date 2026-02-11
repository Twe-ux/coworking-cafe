import { useCallback, useState } from 'react'
import type { Employee } from '@/hooks/useEmployees'
import type { TimeEntry, NewShiftData, EditingCell } from '../types'
import { useTimeEntriesData } from './useTimeEntriesData'
import { useTimeEntryAPI } from './useTimeEntryAPI'

interface UseTimeEntriesOptions {
  employees: Employee[]
  currentDate: Date
}

export function useTimeEntries({ employees, currentDate }: UseTimeEntriesOptions) {
  // Data management
  const {
    timeEntries,
    groupedEntries,
    availableEmployees,
    availableDates,
    isLoading,
    filters,
    handleFilterChange,
    clearFilters,
    fetchTimeEntries,
  } = useTimeEntriesData({ employees, currentDate })

  // API operations
  const {
    handleDeleteShift: apiDeleteShift,
    isCreatingShift,
    handleCreateShift: apiCreateShift,
    isSaving,
    handleUpdateTimeEntry,
  } = useTimeEntryAPI()

  // Cell editing state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')

  // Add shift dialog state
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false)
  const [newShift, setNewShift] = useState<NewShiftData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
  })

  // Cell editing handlers
  const handleCellClick = useCallback(
    (entry: TimeEntry, field: EditingCell['field']) => {
      if (isSaving) return

      let value = ''
      if (field === 'clockIn') value = entry.clockIn
      else if (field === 'clockOut' && entry.clockOut) value = entry.clockOut
      else if (field === 'date') value = entry.date

      setEditingCell({ entryId: entry.id, field })
      setEditValue(value)
    },
    [isSaving]
  )

  const handleCellSave = useCallback(async () => {
    if (!editingCell || !editValue.trim()) {
      setEditingCell(null)
      return
    }

    const success = await handleUpdateTimeEntry(
      editingCell.entryId,
      editingCell.field,
      editValue,
      fetchTimeEntries
    )

    if (success) {
      setEditingCell(null)
      setEditValue('')
    }
  }, [editingCell, editValue, handleUpdateTimeEntry, fetchTimeEntries])

  const handleCellCancel = useCallback(() => {
    setEditingCell(null)
    setEditValue('')
  }, [])

  // Delete shift wrapper
  const handleDeleteShift = useCallback(
    (shiftId: string) => apiDeleteShift(shiftId, fetchTimeEntries),
    [apiDeleteShift, fetchTimeEntries]
  )

  // Create shift wrapper
  const handleCreateShift = useCallback(async () => {
    const success = await apiCreateShift(newShift, fetchTimeEntries)
    if (success) {
      setShowAddShiftDialog(false)
      setNewShift({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '',
        clockOut: '',
      })
    }
  }, [apiCreateShift, newShift, fetchTimeEntries])

  const handleCancelAddShift = useCallback(() => {
    setShowAddShiftDialog(false)
    setNewShift({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      clockIn: '',
      clockOut: '',
    })
  }, [])

  // Open add shift dialog pre-filled for a specific empty slot
  const handleEmptySlotClick = useCallback(
    (employeeId: string, date: string, period: 'morning' | 'afternoon') => {
      setNewShift({
        employeeId,
        date,
        clockIn: period === 'morning' ? '09:30' : '14:30',
        clockOut: '',
      })
      setShowAddShiftDialog(true)
    },
    []
  )

  return {
    // Data
    timeEntries,
    groupedEntries,
    availableEmployees,
    availableDates,
    isLoading,

    // Filters
    filters,
    handleFilterChange,
    clearFilters,

    // Editing
    editingCell,
    editValue,
    isSaving,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    setEditValue,

    // Add shift
    showAddShiftDialog,
    setShowAddShiftDialog,
    newShift,
    setNewShift,
    isCreatingShift,
    handleCreateShift,
    handleCancelAddShift,

    // Empty slot
    handleEmptySlotClick,

    // Actions
    handleDeleteShift,
    fetchTimeEntries,
  }
}
