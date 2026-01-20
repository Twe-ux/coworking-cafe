'use client'

import type { Employee } from '@/hooks/useEmployees'
import { formatHoursToHHMM } from './utils'

interface StaffColumnProps {
  employees: Employee[]
  weeklyHoursCalculator: (employeeId: string) => number
}

/**
 * Staff column showing employee names and weekly hours
 */
export function StaffColumn({ employees, weeklyHoursCalculator }: StaffColumnProps) {
  return (
    <div className="w-32 flex-shrink-0">
      {/* Header */}
      <div className="flex min-h-[40px] items-center justify-center rounded-t-lg border border-gray-400 bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
        Staff
      </div>

      {/* Employee list */}
      <div className="flex min-h-[120px] flex-col rounded-b-lg border-r border-b border-l border-gray-400 bg-gray-50 p-2">
        <div className="h-6" />
        <div className="flex-1 space-y-1 overflow-hidden">
          {employees.map((employee) => {
            const weeklyHours = weeklyHoursCalculator(employee.id)

            return (
              <div
                key={employee.id}
                className="flex h-5 items-center justify-between rounded px-1 text-xs font-medium text-white"
                style={{ backgroundColor: employee.color || '#9CA3AF' }}
              >
                <span className="flex-1 truncate">{employee.firstName}</span>
                <span className="ml-1 text-xs opacity-90">
                  {formatHoursToHHMM(weeklyHours)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
