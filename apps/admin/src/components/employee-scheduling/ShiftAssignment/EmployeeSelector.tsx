/**
 * Employee selection component for shift assignment
 * Displays employees as clickable buttons with color badges
 */

import { AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import type { EmployeeSelectorProps } from './types'

export function EmployeeSelector({
  employees,
  selectedEmployeeId,
  persistentEmployeeId,
  isEditing,
  error,
  onSelect,
}: EmployeeSelectorProps) {
  const preselectedEmployee = employees.find((emp) => emp.id === persistentEmployeeId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Employee *</Label>
        {persistentEmployeeId && !isEditing && preselectedEmployee && (
          <span className="text-xs text-gray-500">
            {preselectedEmployee.firstName} pre-selected
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
                ? `${employee.color} border-blue-500 text-white shadow-lg ring-2 ring-blue-200`
                : `${employee.color} border-gray-300 text-white opacity-40 hover:border-gray-400 hover:opacity-70`
            }`}
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
