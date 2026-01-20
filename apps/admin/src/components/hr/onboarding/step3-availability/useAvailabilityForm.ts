import { useState } from 'react'
import type { Availability, WeeklyDistributionData } from '@/types/onboarding'
import type { UseAvailabilityFormProps, UseAvailabilityFormReturn, TimeSlotWithId } from './types'
import { DAYS } from './types'
import { createDefaultSlot, cleanAvailability } from './utils'

/**
 * Custom hook to manage availability form state and logic
 */
export function useAvailabilityForm({
  initialAvailability,
  initialWeeklyDistribution,
  contractualHours,
}: UseAvailabilityFormProps): UseAvailabilityFormReturn {
  const [availability, setAvailability] = useState<Availability>(initialAvailability)
  const [weeklyDistribution, setWeeklyDistribution] = useState<WeeklyDistributionData>(
    initialWeeklyDistribution
  )

  /**
   * Toggle day availability
   */
  const toggleDay = (day: keyof Availability) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }))
  }

  /**
   * Add new time slot to a day
   */
  const addSlot = (day: keyof Availability) => {
    setAvailability((prev) => {
      const newSlot = createDefaultSlot(day)
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...prev[day].slots, newSlot],
        },
      }
    })
  }

  /**
   * Remove time slot from a day
   */
  const removeSlot = (day: keyof Availability, slotId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((slot) => (slot as TimeSlotWithId).id !== slotId),
      },
    }))
  }

  /**
   * Update time slot field (start or end)
   */
  const updateSlot = (
    day: keyof Availability,
    slotId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability((prev) => {
      const updatedSlots = prev[day].slots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        id: (slot as TimeSlotWithId).id,
      }))

      const slotIndex = updatedSlots.findIndex((s) => s.id === slotId)
      if (slotIndex !== -1) {
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          [field]: value,
        }
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
        },
      }
    })
  }

  /**
   * Update weekly distribution hours
   */
  const updateWeeklyHours = (
    day: keyof Availability,
    week: 'week1' | 'week2' | 'week3' | 'week4',
    value: string
  ) => {
    setWeeklyDistribution((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [week]: value,
      },
    }))
  }

  /**
   * Calculate total hours for a week
   */
  const calculateWeekTotal = (week: string): number => {
    return DAYS.reduce((total, { key }) => {
      const hours = parseFloat(
        weeklyDistribution[key]?.[week as 'week1' | 'week2' | 'week3' | 'week4'] || '0'
      )
      return total + hours
    }, 0)
  }

  /**
   * Calculate grand total (all weeks)
   */
  const calculateGrandTotal = (): number => {
    return ['week1', 'week2', 'week3', 'week4'].reduce((sum, week) => {
      return sum + calculateWeekTotal(week)
    }, 0)
  }

  const expectedTotal = contractualHours * 4
  const grandTotal = calculateGrandTotal()
  const isDistributionValid = Math.abs(grandTotal - expectedTotal) < 0.1

  const hasAvailability = DAYS.some(
    ({ key }) => availability[key].available && availability[key].slots.length > 0
  )

  const canSubmit = hasAvailability && isDistributionValid

  /**
   * Get cleaned availability data for submission
   */
  const getCleanedAvailability = (): Availability => {
    return cleanAvailability(availability)
  }

  return {
    availability,
    weeklyDistribution,
    toggleDay,
    addSlot,
    removeSlot,
    updateSlot,
    updateWeeklyHours,
    calculateWeekTotal,
    calculateGrandTotal,
    isDistributionValid,
    hasAvailability,
    canSubmit,
    getCleanedAvailability,
  }
}
