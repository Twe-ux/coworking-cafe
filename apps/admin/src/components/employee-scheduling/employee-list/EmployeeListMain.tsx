'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import CreateEmployeeModal from '../CreateEmployeeModal'
import EditEmployeeModal from '../EditEmployeeModal'
import DeleteEmployeeDialog from '../DeleteEmployeeDialog'
import { EmployeeListSkeleton } from './EmployeeListSkeleton'
import { EmployeeListFilters } from './EmployeeListFilters'
import { EmployeeListStats } from './EmployeeListStats'
import { EmployeeListGrid } from './EmployeeListGrid'
import { useEmployeeListLogic } from './useEmployeeListLogic'
import type { EmployeeListProps } from './types'

export function EmployeeListMain({
  onEmployeeSelect,
  onEmployeeEdit,
  className,
}: EmployeeListProps) {
  const {
    // Data
    filteredEmployees,
    statistics,
    isLoading,
    error,

    // Filters state
    searchTerm,
    selectedRole,
    viewMode,

    // Modals state
    showCreateModal,
    showEditModal,
    showDeleteDialog,
    selectedEmployee,
    isDeleting,

    // Actions
    setSearchTerm,
    setSelectedRole,
    setViewMode,
    handleCreateClick,
    handleEditEmployee,
    handleDeleteEmployee,
    handleCreateSuccess,
    handleUpdateSuccess,
    handleDeleteConfirm,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDeleteDialog,
  } = useEmployeeListLogic()

  // Loading state
  if (isLoading) {
    return <EmployeeListSkeleton className={className} />
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Handle edit callback
  const handleEdit = (employee: Parameters<typeof handleEditEmployee>[0]) => {
    handleEditEmployee(employee)
    onEmployeeEdit?.(employee)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des employés
          </h2>
          <p className="text-gray-600">
            {filteredEmployees.length} employé
            {filteredEmployees.length > 1 ? 's' : ''} actif
            {filteredEmployees.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button
          onClick={handleCreateClick}
          className="bg-coffee-primary hover:bg-coffee-primary/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      {/* Filters */}
      <EmployeeListFilters
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onRoleChange={setSelectedRole}
        onViewModeChange={setViewMode}
      />

      {/* Statistics */}
      <EmployeeListStats statistics={statistics} />

      {/* Employee Grid/List */}
      <EmployeeListGrid
        employees={filteredEmployees}
        viewMode={viewMode}
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        onEmployeeSelect={onEmployeeSelect}
        onEditEmployee={handleEdit}
        onDeleteEmployee={handleDeleteEmployee}
        onCreateEmployee={handleCreateClick}
      />

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      <EditEmployeeModal
        employee={selectedEmployee}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteEmployeeDialog
        employee={selectedEmployee}
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
