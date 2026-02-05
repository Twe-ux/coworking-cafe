'use client'

import { Button } from '@/components/ui/button'
import { Clock, Download, Plus } from 'lucide-react'
import type { Employee } from '@/hooks/useEmployees'
import { useTimeEntries } from './hooks/useTimeEntries'
import { TimeEntriesFilters } from './TimeEntriesFilters'
import { TimeEntriesTable } from './TimeEntriesTable'
import { AddShiftDialog } from './AddShiftDialog'

interface TimeEntriesListProps {
  employees: Employee[]
  currentDate: Date
  className?: string
}

export default function TimeEntriesList({
  employees,
  currentDate,
  className = '',
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
    fetchTimeEntries,
  } = useTimeEntries({ employees, currentDate })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCellSave()
    else if (e.key === 'Escape') handleCellCancel()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des Pointages
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddShiftDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un shift
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TimeEntriesFilters
        filters={filters}
        availableEmployees={availableEmployees}
        availableDates={availableDates}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

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
      />

      {/* Instructions and Summary */}
      {groupedEntries.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-center">
            <p className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
              Cliquez sur les heures ou dates pour les modifier directement
            </p>
          </div>
          <div className="flex justify-center">
            <p className="text-sm text-gray-600">
              {groupedEntries.length} journee{groupedEntries.length > 1 ? 's' : ''}{' '}
              de travail affichee{groupedEntries.length > 1 ? 's' : ''}
            </p>
          </div>
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
