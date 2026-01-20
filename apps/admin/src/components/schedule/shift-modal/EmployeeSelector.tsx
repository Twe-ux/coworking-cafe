'use client'

import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import type { Employee } from '@/types/hr'

interface EmployeeSelectorProps {
  employees: Employee[]
  selectedEmployeeId: string
  persistentEmployeeId: string
  existingShift: boolean
  error?: string
  onSelect: (employeeId: string) => void
}

/**
 * Employee selection component with visual badges
 */
export function EmployeeSelector({
  employees,
  selectedEmployeeId,
  persistentEmployeeId,
  existingShift,
  error,
  onSelect,
}: EmployeeSelectorProps) {
  const preselectedEmployee = employees.find((emp) => emp.id === persistentEmployeeId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Employe *</Label>
        {persistentEmployeeId && !existingShift && preselectedEmployee && (
          <span className="text-xs text-gray-500">
            {preselectedEmployee.firstName} pre-selectionne
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {employees.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => onSelect(employee.id)}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
              selectedEmployeeId === employee.id
                ? 'border-blue-500 text-white shadow-lg ring-2 ring-blue-200'
                : 'border-gray-300 text-white opacity-40 hover:border-gray-400 hover:opacity-70'
            }`}
            style={{ backgroundColor: employee.color || '#9CA3AF' }}
          >
            {employee.firstName}
          </button>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
