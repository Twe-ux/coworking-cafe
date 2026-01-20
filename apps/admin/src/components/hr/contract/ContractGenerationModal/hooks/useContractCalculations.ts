/**
 * Hook for contract calculations
 * Handles salary, hours, and schedule calculations
 */

import { useMemo, useCallback } from 'react'
import type { TimeSlot } from '@/types/hr'
import type { Employee, UseContractCalculationsReturn } from '../types'
import { WEEKS_PER_MONTH, FULL_TIME_HOURS } from '../constants'

interface UseContractCalculationsOptions {
  employee: Employee
}

/**
 * Calculate total minutes from time slots
 */
function calculateTotalMinutes(slots: TimeSlot[]): number {
  return slots.reduce((total, slot) => {
    const [startH, startM] = slot.start.split(':').map(Number)
    const [endH, endM] = slot.end.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return total + (endMinutes - startMinutes)
  }, 0)
}

/**
 * Format minutes as hours string (e.g., "8h" or "8h30")
 */
function formatHoursFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`
}

export function useContractCalculations({
  employee,
}: UseContractCalculationsOptions): UseContractCalculationsReturn {
  // Calculate monthly salary
  const monthlySalary = useMemo(() => {
    if (!employee.hourlyRate) return '0.00'
    const salary = employee.hourlyRate * employee.contractualHours * WEEKS_PER_MONTH
    return salary.toFixed(2)
  }, [employee.hourlyRate, employee.contractualHours])

  // Calculate monthly hours
  const monthlyHours = useMemo(() => {
    return (employee.contractualHours * WEEKS_PER_MONTH).toFixed(2)
  }, [employee.contractualHours])

  // Check if full-time contract
  const isFullTime = useMemo(() => {
    return employee.contractualHours >= FULL_TIME_HOURS
  }, [employee.contractualHours])

  // Contract type label for documents
  const contractTypeLabel = useMemo(() => {
    return isFullTime ? 'complet' : 'partiel'
  }, [isFullTime])

  // Calculate hours for a day's time slots
  const calculateDayHours = useCallback((slots: TimeSlot[]): string => {
    if (!slots || slots.length === 0) return ''
    const totalMinutes = calculateTotalMinutes(slots)
    return formatHoursFromMinutes(totalMinutes)
  }, [])

  return {
    monthlySalary,
    monthlyHours,
    calculateDayHours,
    isFullTime,
    contractTypeLabel,
  }
}
