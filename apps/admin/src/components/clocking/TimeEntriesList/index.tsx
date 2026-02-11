'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Plus } from 'lucide-react'
import type { Employee } from '@/hooks/useEmployees'
import { useTimeEntries } from './hooks/useTimeEntries'
import { TimeEntriesFilters } from './TimeEntriesFilters'
import { TimeEntriesTable } from './TimeEntriesTable'
import { AddShiftDialog } from './AddShiftDialog'

interface TimeEntriesListProps {
  employees: Employee[]
  currentDate: Date
  className?: string
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  onToday?: () => void
}

export default function TimeEntriesList({
  employees,
  currentDate,
  className = '',
  onPreviousMonth,
  onNextMonth,
  onToday,
}: TimeEntriesListProps) {
  const {
    groupedEntries,
    availableEmployees,
    availableDates,
    isLoading,
    filters,
    handleFilterChange,
    clearFilters,
    editingCell,
    editValue,
    isSaving,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    setEditValue,
    showAddShiftDialog,
    setShowAddShiftDialog,
    newShift,
    setNewShift,
    isCreatingShift,
    handleCreateShift,
    handleCancelAddShift,
    handleDeleteShift,
    handleEmptySlotClick,
    fetchTimeEntries,
  } = useTimeEntries({ employees, currentDate })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCellSave()
    else if (e.key === 'Escape') handleCellCancel()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters (3/4) + Action buttons (1/4) */}
      <div className="flex gap-4">
        <div className="flex-1">
          <TimeEntriesFilters
            filters={filters}
            availableEmployees={availableEmployees}
            availableDates={availableDates}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            currentDate={currentDate}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
            onToday={onToday}
          />
        </div>
        <Card className="w-[400px] shrink-0">
          <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
            <Button
              className="w-[250px] mx-auto"
              variant="default"
              onClick={() => setShowAddShiftDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un shift
            </Button>
            <Button className="w-[250px] mx-auto" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <TimeEntriesTable
        groupedEntries={groupedEntries}
        isLoading={isLoading}
        editingCell={editingCell}
        editValue={editValue}
        isSaving={isSaving}
        onCellClick={handleCellClick}
        onEditValueChange={setEditValue}
        onCellSave={handleCellSave}
        onKeyDown={handleKeyDown}
        onDeleteShift={handleDeleteShift}
        onJustificationRead={fetchTimeEntries}
        onEmptySlotClick={handleEmptySlotClick}
      />

      {/* Instructions */}
      {groupedEntries.length > 0 && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-600">
            {groupedEntries.length} journee{groupedEntries.length > 1 ? 's' : ''}{' '}
            de travail affichee{groupedEntries.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Add Shift Dialog */}
      <AddShiftDialog
        isOpen={showAddShiftDialog}
        employees={employees}
        newShift={newShift}
        isCreating={isCreatingShift}
        onShiftChange={(data) =>
          setNewShift((prev) => ({ ...prev, ...data }))
        }
        onCreate={handleCreateShift}
        onCancel={handleCancelAddShift}
      />
    </div>
  )
}
