'use client'

import { CardContent } from '@/components/ui/card'
import type { Employee } from '@/types/hr'
import TimeTrackingCard from '@/components/shared/TimeTrackingCard'

interface TimeTrackingSectionProps {
  employees: Employee[]
}

/**
 * Section displaying time tracking cards for all employees
 */
export function TimeTrackingSection({ employees }: TimeTrackingSectionProps) {
  const getGridClass = () => {
    if (employees.length >= 5) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
    }
    if (employees.length === 4) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <CardContent className="pt-0">
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Pointage des Employes</h3>
          <div className={`grid gap-4 ${getGridClass()}`}>
            {employees.map((employee) => (
              <TimeTrackingCard
                key={employee.id}
                employee={employee}
                onStatusChange={() => {
                  // Refresh data when status changes
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  )
}
