'use client'

import { useMemo, useCallback } from 'react'
import type { Employee } from '@/hooks/useEmployees'
import type { Shift } from '@/hooks/useShifts'
import type { WeekData, OrganizedShifts, PositionedShifts } from './types'
import {
  getFrenchDate,
  getWeekStart,
  getWeekEnd,
  isShiftBeforeCutoff,
  calculateShiftDuration,
} from './utils'

interface UseScheduleDataProps {
  employees: Employee[]
  shifts: Shift[]
}

interface UseScheduleDataReturn {
  getSchedulesForDate: (date: Date) => Shift[]
  getShiftsPositionedByEmployee: (date: Date) => PositionedShifts[]
  getWeeksWithShifts: () => WeekData[]
  calculateWeeklyHours: (employeeId: string, weekStart: Date, weekEnd: Date) => number
  organizeShiftsByTimeSlots: (shifts: Shift[]) => OrganizedShifts
}

/**
 * Hook for schedule data operations
 */
export function useScheduleData({
  employees,
  shifts,
}: UseScheduleDataProps): UseScheduleDataReturn {
  /**
   * Get schedules for a specific date
   */
  const getSchedulesForDate = useCallback(
    (date: Date): Shift[] => {
      const normalizedDate = getFrenchDate(date)

      return shifts.filter((schedule) => {
        const normalizedScheduleDate = getFrenchDate(schedule.date)
        return normalizedScheduleDate.toDateString() === normalizedDate.toDateString()
      })
    },
    [shifts]
  )

  /**
   * Organize shifts by morning/afternoon slots
   */
  const organizeShiftsByTimeSlots = useCallback((shiftsToOrganize: Shift[]): OrganizedShifts => {
    const morning = shiftsToOrganize.filter((shift) => isShiftBeforeCutoff(shift.startTime))
    const afternoon = shiftsToOrganize.filter((shift) => !isShiftBeforeCutoff(shift.startTime))

    return { morning, afternoon }
  }, [])

  /**
   * Get shifts positioned by employee for a date
   */
  const getShiftsPositionedByEmployee = useCallback(
    (date: Date): PositionedShifts[] => {
      const daySchedules = getSchedulesForDate(date)

      return employees.map((employee) => {
        const employeeShifts = daySchedules.filter(
          (shift) => shift.employeeId === employee.id
        )
        const organizedShifts = organizeShiftsByTimeSlots(employeeShifts)

        return {
          employee,
          shifts: employeeShifts,
          morningShifts: organizedShifts.morning,
          afternoonShifts: organizedShifts.afternoon,
        }
      })
    },
    [employees, getSchedulesForDate, organizeShiftsByTimeSlots]
  )

  /**
   * Get weeks that have shifts (current week + 2 next weeks)
   */
  const getWeeksWithShifts = useCallback((): WeekData[] => {
    const today = getFrenchDate(new Date())
    const currentWeekStart = getWeekStart(today)
    const threeWeeksLater = new Date(
      currentWeekStart.getTime() + 3 * 7 * 24 * 60 * 60 * 1000
    )

    // Group shifts by week
    const shiftsByWeek = new Map<number, Shift[]>()

    shifts.forEach((shift) => {
      const shiftDate = getFrenchDate(shift.date)
      const shiftWeekStart = getWeekStart(shiftDate)
      const weekKey = shiftWeekStart.getTime()

      // Include only current week and next 2 weeks
      if (shiftWeekStart >= currentWeekStart && shiftWeekStart < threeWeeksLater) {
        if (!shiftsByWeek.has(weekKey)) {
          shiftsByWeek.set(weekKey, [])
        }
        shiftsByWeek.get(weekKey)?.push(shift)
      }
    })

    // Convert to array and sort by date
    return Array.from(shiftsByWeek.entries())
      .map(([weekStartTime, weekShifts]) => ({
        weekStart: new Date(weekStartTime),
        weekEnd: getWeekEnd(new Date(weekStartTime)),
        shifts: weekShifts,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
  }, [shifts])

  /**
   * Calculate total hours for an employee in a week
   */
  const calculateWeeklyHours = useCallback(
    (employeeId: string, weekStart: Date, weekEnd: Date): number => {
      const employeeShifts = shifts.filter((shift) => {
        if (shift.employeeId !== employeeId) return false

        const shiftDateObj = new Date(shift.date)
        const shiftDate = new Date(
          shiftDateObj.getFullYear(),
          shiftDateObj.getMonth(),
          shiftDateObj.getDate()
        )
        const startDate = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate()
        )
        const endDate = new Date(
          weekEnd.getFullYear(),
          weekEnd.getMonth(),
          weekEnd.getDate()
        )

        return shiftDate >= startDate && shiftDate <= endDate
      })

      return employeeShifts.reduce(
        (totalHours, shift) => totalHours + calculateShiftDuration(shift),
        0
      )
    },
    [shifts]
  )

  return {
    getSchedulesForDate,
    getShiftsPositionedByEmployee,
    getWeeksWithShifts,
    calculateWeeklyHours,
    organizeShiftsByTimeSlots,
  }
}
