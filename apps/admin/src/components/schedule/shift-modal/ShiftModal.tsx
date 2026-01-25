'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Edit2, Plus, Save, Trash2, X } from 'lucide-react'

import type { ShiftModalProps } from './types'
import { useShiftTypes } from './useShiftTypes'
import { useShiftForm } from './useShiftForm'
import { DateDisplay } from './DateDisplay'
import { EmployeeSelector } from './EmployeeSelector'
import { ShiftTypeSelector } from './ShiftTypeSelector'
import { TimeSelector } from './TimeSelector'
import { DurationDisplay } from './DurationDisplay'
import { ShiftTypeEditorDialog } from './ShiftTypeEditorDialog'

/**
 * Modal for creating and editing shifts
 * Refactored from 879 lines to ~150 lines using sub-components and hooks
 */
export function ShiftModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  employees,
  selectedDate,
  existingShift,
}: ShiftModalProps) {
  // Hooks for state management
  const { shiftTypes, saveShiftType, deleteShiftType, updateShiftType } = useShiftTypes()

  const {
    formData,
    errors,
    isSubmitting,
    persistentEmployeeId,
    isEditing,
    setFormData,
    handleEmployeeSelect,
    handleShiftTypeChange,
    handleQuickSubmit,
    handleSubmit,
    handleDelete,
    calculateDuration,
  } = useShiftForm({
    existingShift,
    selectedDate,
    onSave,
    onUpdate,
    onDelete,
    onClose,
    open,
    shiftTypes,
  })

  // Local UI state
  const [showSettings, setShowSettings] = useState(false)
  const [editingShiftType, setEditingShiftType] = useState<string | null>(null)

  // Computed values
  const selectedEmployee = employees.find((e) => e.id === formData.employeeId)
  const duration = calculateDuration()

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {isEditing ? 'Modifier le creneau' : 'Ajouter un creneau'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Display */}
            <DateDisplay date={formData.date} />

            {/* Employee Selection */}
            <EmployeeSelector
              employees={employees}
              selectedEmployeeId={formData.employeeId}
              persistentEmployeeId={persistentEmployeeId}
              existingShift={!!existingShift}
              error={errors.employeeId}
              onSelect={handleEmployeeSelect}
            />

            {/* Shift Type Selection */}
            <ShiftTypeSelector
              shiftTypes={shiftTypes}
              selectedType={formData.type}
              showSettings={showSettings}
              selectedEmployee={selectedEmployee}
              onTypeChange={handleShiftTypeChange}
              onQuickSubmit={handleQuickSubmit}
              onToggleSettings={() => setShowSettings(!showSettings)}
              onEditType={setEditingShiftType}
              onDeleteType={deleteShiftType}
              onAddNew={() => setEditingShiftType('new')}
            />

            {/* Time Selection */}
            <TimeSelector
              startTime={formData.startTime}
              endTime={formData.endTime}
              startTimeError={errors.startTime}
              endTimeError={errors.endTime}
              onStartTimeChange={(time) => setFormData((prev) => ({ ...prev, startTime: time }))}
              onEndTimeChange={(time) => setFormData((prev) => ({ ...prev, endTime: time }))}
            />

            {/* Duration Display */}
            <DurationDisplay duration={duration} />

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="flex items-center gap-2 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex w-full items-center gap-2 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}

            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex flex-1 items-center gap-2 sm:flex-none"
              >
                <Save className="h-4 w-4" />
                {isSubmitting
                  ? 'Enregistrement...'
                  : isEditing
                    ? 'Modifier'
                    : 'Ajouter'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Type Editor Dialog */}
      <ShiftTypeEditorDialog
        open={!!editingShiftType}
        editingKey={editingShiftType}
        shiftTypes={shiftTypes}
        onClose={() => setEditingShiftType(null)}
        onSave={saveShiftType}
        onUpdate={updateShiftType}
      />
    </>
  )
}
