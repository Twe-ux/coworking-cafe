import { TabsContent } from '@/components/ui/tabs'
import { DayAvailability } from './DayAvailability'
import type { Availability } from '@/types/onboarding'
import { DAYS } from './types'

/**
 * Props for AvailabilityTab component
 */
interface AvailabilityTabProps {
  availability: Availability
  onToggleDay: (day: keyof Availability) => void
  onAddSlot: (day: keyof Availability) => void
  onUpdateSlot: (day: keyof Availability, slotId: string, field: 'start' | 'end', value: string) => void
  onRemoveSlot: (day: keyof Availability, slotId: string) => void
}

/**
 * Availability tab content component
 */
export function AvailabilityTab({
  availability,
  onToggleDay,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: AvailabilityTabProps) {
  return (
    <TabsContent value="availability" className="space-y-6 mt-6">
      {DAYS.map((day) => (
        <DayAvailability
          key={day.key}
          day={day}
          availability={availability}
          onToggleDay={onToggleDay}
          onAddSlot={onAddSlot}
          onUpdateSlot={onUpdateSlot}
          onRemoveSlot={onRemoveSlot}
        />
      ))}
    </TabsContent>
  )
}
