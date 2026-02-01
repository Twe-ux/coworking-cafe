'use client'

import type { Employee } from '@/hooks/useEmployees'
import type { PositionedShifts } from './types'
import { isToday } from './utils'
import { ShiftBadge } from './ShiftBadge'

interface DayCellProps {
  day: Date
  employees: Employee[]
  positionedShifts: PositionedShifts[]
  isFirstDay?: boolean
  isLastDay?: boolean
}

/**
 * Single day cell in the week calendar
 */
export function DayCell({ day, employees, positionedShifts, isFirstDay, isLastDay }: DayCellProps) {
  const dayIsToday = isToday(day)

  // Arrondir les coins bas si c'est aujourd'hui et première/dernière cellule
  const roundedClass = dayIsToday
    ? isFirstDay
      ? 'rounded-bl-lg'
      : isLastDay
      ? 'rounded-br-lg'
      : ''
    : '';

  return (
    <div
      className={`flex min-h-[120px] flex-col bg-white p-2 ${
        dayIsToday ? 'ring-2 ring-blue-500 ring-inset' : ''
      } ${roundedClass} cursor-pointer transition-colors hover:bg-gray-50`}
    >
      {/* Day number */}
      <div
        className={`mb-1 text-sm font-medium ${
          dayIsToday ? 'text-blue-600' : 'text-gray-900'
        }`}
      >
        {day.getDate()}
      </div>

      {/* Employee shifts */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {employees.map((employee) => {
          const employeeShifts = positionedShifts.find(
            (ps) => ps.employee.id === employee.id
          )
          const morningShifts = employeeShifts?.morningShifts || []
          const afternoonShifts = employeeShifts?.afternoonShifts || []

          return (
            <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-2">
              {/* Morning column (before 14:30) */}
              <div className="space-y-1 text-center">
                {morningShifts.length > 0 ? (
                  morningShifts.map((shift) => (
                    <ShiftBadge
                      key={shift.id}
                      shift={shift}
                      employee={employee}
                      colorOverride={(shift as any)._unavailabilityRequested ? '#f97316' : undefined}
                    />
                  ))
                ) : (
                  <div className="h-5 py-0.5" />
                )}
              </div>

              {/* Afternoon column (after 14:30) */}
              <div className="space-y-1 text-center">
                {afternoonShifts.length > 0 ? (
                  afternoonShifts.map((shift) => (
                    <ShiftBadge
                      key={shift.id}
                      shift={shift}
                      employee={employee}
                      colorOverride={(shift as any)._unavailabilityRequested ? '#f97316' : undefined}
                    />
                  ))
                ) : (
                  <div className="h-5 py-0.5" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
