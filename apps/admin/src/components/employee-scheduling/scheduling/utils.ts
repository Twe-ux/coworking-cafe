/**
 * Utility functions for EmployeeScheduling
 */

import type { Shift } from '@/hooks/useShifts'
import { CUTOFF_TIME_IN_MINUTES } from './types'

/**
 * Normalize date to French timezone
 */
export function getFrenchDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
}

/**
 * Get start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = getFrenchDate(date)
  const day = d.getDay()
  const dayAdjusted = day === 0 ? 6 : day - 1
  const diff = d.getDate() - dayAdjusted
  const weekStart = new Date(d.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Get end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
}

/**
 * Get all days in a week starting from the given date
 */
export function getDaysInWeek(weekStart: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    days.push(day)
  }
  return days
}

/**
 * Check if shift starts before cutoff time (14:30)
 */
export function isShiftBeforeCutoff(startTime: string): boolean {
  if (!startTime || typeof startTime !== 'string') {
    console.warn('Invalid start time:', startTime)
    return false
  }

  const timeParts = startTime.split(':')
  if (timeParts.length !== 2) {
    console.warn('Invalid time format:', startTime)
    return false
  }

  const [hours, minutes] = timeParts.map(Number)
  if (isNaN(hours) || isNaN(minutes)) {
    console.warn('Non-numeric hours or minutes:', startTime)
    return false
  }

  const startTimeInMinutes = hours * 60 + minutes
  return startTimeInMinutes < CUTOFF_TIME_IN_MINUTES
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString()
}

/**
 * Format decimal hours to HH:MM
 */
export function formatHoursToHHMM(decimalHours: number): string {
  if (decimalHours <= 0) return ''

  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)

  if (minutes === 60) {
    return `${String(hours + 1).padStart(2, '0')}:00`
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Calculate shift duration in hours
 */
export function calculateShiftDuration(shift: Shift): number {
  const start = new Date(`2000-01-01 ${shift.startTime}`)
  let end = new Date(`2000-01-01 ${shift.endTime}`)

  // Handle night shifts that end the next day
  if (shift.type === 'night' && end <= start) {
    end.setDate(end.getDate() + 1)
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return Math.max(0, hours)
}
