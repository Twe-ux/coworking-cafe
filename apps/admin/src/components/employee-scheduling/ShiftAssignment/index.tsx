'use client'

/**
 * ShiftAssignment Modal
 * Modal for creating and editing employee shifts
 *
 * Structure:
 * - index.tsx (this file): Main modal component (<150 lines)
 * - types.ts: TypeScript interfaces
 * - constants.ts: Default shift types and configuration
 * - hooks/useShiftAssignment.ts: Form state and submission logic
 * - hooks/useShiftTypes.ts: Shift type management
 * - EmployeeSelector.tsx: Employee selection buttons
 * - ShiftTypeSelector.tsx: Shift type cards
 * - TimeSelector.tsx: Start/end time inputs
 * - ShiftPreview.tsx: Shift preview card
 * - ShiftTypeSettings.tsx: Shift type management panel
 * - ShiftTypeEditor.tsx: Edit/create shift type dialog
 * - DateDisplay.tsx: Selected date display
 * - DurationDisplay.tsx: Calculated duration display
 * - DialogActions.tsx: Footer action buttons
 */

import { Edit2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { ShiftAssignmentProps } from './types'
import { useShiftAssignment } from './hooks/useShiftAssignment'
import { useShiftTypes } from './hooks/useShiftTypes'
import { DateDisplay } from './DateDisplay'
import { EmployeeSelector } from './EmployeeSelector'
import { ShiftTypeSelector } from './ShiftTypeSelector'
import { ShiftTypeSettings } from './ShiftTypeSettings'
import { TimeSelector } from './TimeSelector'
import { DurationDisplay } from './DurationDisplay'
import { ShiftPreview } from './ShiftPreview'
import { ShiftTypeEditor } from './ShiftTypeEditor'
import { DialogActions } from './DialogActions'

// Re-export types for backward compatibility
export type { ShiftAssignmentProps } from './types'

export default function ShiftAssignment({
  employees,
  selectedDate = new Date(),
  existingShift = null,
  onSave,
  onUpdate,
  onDelete,
  onClose,
  open,
}: ShiftAssignmentProps) {
  const {
    shiftTypes,
    showSettings,
    editingShiftType,
    newShiftType,
    setShowSettings,
    setEditingShiftType,
    handleDeleteShiftType,
    handleSaveShiftType,
    updateShiftType,
    updateNewShiftType,
  } = useShiftTypes()

  const {
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
  } = useShiftAssignment({
    employees,
    selectedDate,
    existingShift,
    shiftTypes,
    open,
    onSave,
    onUpdate,
    onDelete,
    onClose,
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? 'Edit Shift' : 'Add New Shift'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <DateDisplay date={formData.date} />

          <EmployeeSelector
            employees={employees}
            selectedEmployeeId={formData.employeeId}
            persistentEmployeeId={persistentEmployeeId}
            isEditing={isEditing}
            error={errors.employeeId}
            onSelect={handleEmployeeSelect}
          />

          <ShiftTypeSelector
            shiftTypes={shiftTypes}
            selectedType={formData.type}
            onTypeChange={handleShiftTypeChange}
            onShowSettings={() => setShowSettings(!showSettings)}
          />

          {showSettings && (
            <ShiftTypeSettings
              shiftTypes={shiftTypes}
              onEdit={setEditingShiftType}
              onDelete={handleDeleteShiftType}
              onAddNew={() => setEditingShiftType('new')}
            />
          )}

          <TimeSelector
            startTime={formData.startTime}
            endTime={formData.endTime}
            startError={errors.startTime}
            endError={errors.endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
          />

          <DurationDisplay duration={duration} />

          {selectedEmployee && (
            <ShiftPreview
              employee={selectedEmployee}
              shiftType={shiftTypes[formData.type]}
              formData={formData}
              duration={duration}
            />
          )}
        </div>

        <DialogActions
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onDelete={handleDelete}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </DialogContent>

      <ShiftTypeEditor
        open={!!editingShiftType}
        onClose={() => setEditingShiftType(null)}
        editingKey={editingShiftType}
        shiftTypes={shiftTypes}
        newShiftType={newShiftType}
        onSave={handleSaveShiftType}
        onUpdateShiftType={updateShiftType}
        onUpdateNewShiftType={updateNewShiftType}
      />
    </Dialog>
  )
}
