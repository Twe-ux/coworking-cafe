import type { Availability, AvailabilitySlot } from '@/types/onboarding'
import type { TimeSlotWithId } from './types'

/**
 * Generate unique ID for time slot
 */
export function generateSlotId(day: string): string {
  return `${day}-${Date.now()}-${Math.random()}`
}

/**
 * Clean availability data by removing IDs and sorting slots
 */
export function cleanAvailability(availability: Availability): Availability {
  return Object.keys(availability).reduce((acc, day) => {
    const dayKey = day as keyof Availability
    const sortedSlots = [...availability[dayKey].slots]
      .map((slot) => ({
        start: slot.start,
        end: slot.end,
      }))
      .sort((a, b) => a.start.localeCompare(b.start))

    return {
      ...acc,
      [day]: {
        available: availability[dayKey].available,
        slots: sortedSlots,
      },
    }
  }, {} as Availability)
}

/**
 * Add ID to slot for React rendering
 */
export function addIdToSlot(slot: AvailabilitySlot, day: string): TimeSlotWithId {
  const slotWithId = slot as TimeSlotWithId
  return {
    start: slotWithId.start,
    end: slotWithId.end,
    id: slotWithId.id || generateSlotId(day),
  }
}

/**
 * Create default time slot
 */
export function createDefaultSlot(day: string): TimeSlotWithId {
  return {
    start: '09:00',
    end: '18:00',
    id: generateSlotId(day),
  }
}
