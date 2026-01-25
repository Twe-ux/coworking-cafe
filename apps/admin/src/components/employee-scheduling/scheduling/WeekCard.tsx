'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Employee } from '@/hooks/useEmployees'
import type { WeekData, PositionedShifts } from './types'
import { DAYS_OF_WEEK } from './types'
import { getDaysInWeek } from './utils'
import { StaffColumn } from './StaffColumn'
import { DayCell } from './DayCell'

interface WeekCardProps {
  week: WeekData
  employees: Employee[]
  getShiftsPositionedByEmployee: (date: Date) => PositionedShifts[]
  calculateWeeklyHours: (employeeId: string, weekStart: Date, weekEnd: Date) => number
  showHours?: boolean
}

/**
 * Card displaying a single week schedule
 */
export function WeekCard({
  week,
  employees,
  getShiftsPositionedByEmployee,
  calculateWeeklyHours,
  showHours = true,
}: WeekCardProps) {
  const daysInWeek = getDaysInWeek(week.weekStart)

  const weeklyHoursCalculator = (employeeId: string) =>
    calculateWeeklyHours(employeeId, week.weekStart, week.weekEnd)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          Semaine du{' '}
          {week.weekStart.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
          })}{' '}
          au{' '}
          {week.weekEnd.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Staff Column */}
          <StaffColumn
            employees={employees}
            weeklyHoursCalculator={weeklyHoursCalculator}
            showHours={showHours}
          />

          {/* Calendar Grid */}
          <div className="flex-1 rounded-lg border border-gray-400">
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-400">
              {/* Day Headers */}
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="flex min-h-[40px] items-center justify-center bg-gray-50 p-2 text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}

              {/* Day Cells */}
              {daysInWeek.map((day, dayIndex) => {
                const positionedShifts = getShiftsPositionedByEmployee(day)

                return (
                  <DayCell
                    key={dayIndex}
                    day={day}
                    employees={employees}
                    positionedShifts={positionedShifts}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
