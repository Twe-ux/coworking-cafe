'use client'

import type { Employee } from '@/hooks/useEmployees'
import type { PositionedShifts } from './types'
import type { ShiftWithUnavailability } from '@/types/shift'
import type { IUnavailabilityWithEmployee } from '@/types/unavailability'
import { isToday } from './utils'
import { ShiftBadge } from './ShiftBadge'
import { CalendarOff } from 'lucide-react'

interface DayCellProps {
  day: Date
  employees: Employee[]
  unavailabilities?: IUnavailabilityWithEmployee[]
  positionedShifts: PositionedShifts[]
  isFirstDay?: boolean
  isLastDay?: boolean
}

/**
 * Single day cell in the week calendar
 */
export function DayCell({
  day,
  employees,
  unavailabilities = [],
  positionedShifts,
  isFirstDay,
  isLastDay
}: DayCellProps) {
  const dayIsToday = isToday(day)

  // Helper: Check if employee is unavailable on this date
  const isEmployeeUnavailable = (employeeId: string): IUnavailabilityWithEmployee | undefined => {
    const dayStr = day.toISOString().split('T')[0];
    return unavailabilities.find(unavail => {
      if (typeof unavail.employeeId === 'object' && unavail.employeeId !== null) {
        const empId = (unavail.employeeId as any).id || (unavail.employeeId as any)._id;
        if (empId !== employeeId) return false;
      } else if (unavail.employeeId !== employeeId) {
        return false;
      }

      return dayStr >= unavail.startDate && dayStr <= unavail.endDate;
    });
  }

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
          const unavailability = isEmployeeUnavailable(employee.id);

          // If employee is unavailable, show absence badge
          if (unavailability) {
            const absenceTypeLabels: Record<string, string> = {
              paid_leave: 'CP',
              sick_leave: 'AM',
              unavailability: 'Indispo'
            };
            const label = absenceTypeLabels[unavailability.type] || 'Absent';
            const bgColor = unavailability.type === 'paid_leave' ? 'bg-green-100 text-green-700 border-green-300'
              : unavailability.type === 'sick_leave' ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-gray-100 text-gray-700 border-gray-300';

            return (
              <div key={employee.id} className="grid min-h-4 grid-cols-1">
                <div className={`flex items-center justify-center gap-1 rounded border px-1 py-0.5 text-xs font-medium ${bgColor}`}>
                  <CalendarOff className="h-3 w-3" />
                  <span>{label}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-2">
              {/* Morning column (before 14:30) */}
              <div className="space-y-1 text-center">
                {morningShifts.length > 0 ? (
                  morningShifts.map((shift) => {
                    const shiftWithMeta = shift as ShiftWithUnavailability;
                    return (
                      <ShiftBadge
                        key={shift.id}
                        shift={shift}
                        employee={employee}
                        colorOverride={shiftWithMeta._unavailabilityRequested ? '#f97316' : undefined}
                      />
                    );
                  })
                ) : (
                  <div className="h-5 py-0.5" />
                )}
              </div>

              {/* Afternoon column (after 14:30) */}
              <div className="space-y-1 text-center">
                {afternoonShifts.length > 0 ? (
                  afternoonShifts.map((shift) => {
                    const shiftWithMeta = shift as ShiftWithUnavailability;
                    return (
                      <ShiftBadge
                        key={shift.id}
                        shift={shift}
                        employee={employee}
                        colorOverride={shiftWithMeta._unavailabilityRequested ? '#f97316' : undefined}
                      />
                    );
                  })
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
