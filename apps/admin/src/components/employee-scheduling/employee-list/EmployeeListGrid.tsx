import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus } from 'lucide-react'
import { EmployeeCard } from './EmployeeCard'
import type { Employee } from '@/hooks/useEmployees'
import type { ViewMode } from './types'

interface EmployeeListGridProps {
  employees: Employee[]
  viewMode: ViewMode
  searchTerm: string
  selectedRole: string
  onEmployeeSelect?: (employee: Employee) => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (employee: Employee) => void
  onCreateEmployee: () => void
}

export function EmployeeListGrid({
  employees,
  viewMode,
  searchTerm,
  selectedRole,
  onEmployeeSelect,
  onEditEmployee,
  onDeleteEmployee,
  onCreateEmployee,
}: EmployeeListGridProps) {
  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {searchTerm || selectedRole !== 'all'
              ? 'Aucun employé trouvé'
              : 'Aucun employé'}
          </h3>
          <p className="mb-4 text-gray-600">
            {searchTerm || selectedRole !== 'all'
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Commencez par ajouter votre premier employé.'}
          </p>
          <Button
            onClick={onCreateEmployee}
            className="bg-coffee-primary hover:bg-coffee-primary/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un employé
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4'
      }
    >
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          viewMode={viewMode}
          onEdit={onEditEmployee}
          onDelete={onDeleteEmployee}
          onSelect={onEmployeeSelect}
        />
      ))}
    </div>
  )
}
