import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { TimeSlotInput } from './TimeSlotInput'
import type { Availability } from '@/types/onboarding'
import type { DayConfig, TimeSlotWithId } from './types'

/**
 * Props for DayAvailability component
 */
interface DayAvailabilityProps {
  day: DayConfig
  availability: Availability
  onToggleDay: (day: keyof Availability) => void
  onAddSlot: (day: keyof Availability) => void
  onUpdateSlot: (day: keyof Availability, slotId: string, field: 'start' | 'end', value: string) => void
  onRemoveSlot: (day: keyof Availability, slotId: string) => void
}

/**
 * Day availability component with time slots
 */
export function DayAvailability({
  day,
  availability,
  onToggleDay,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: DayAvailabilityProps) {
  const dayData = availability[day.key]

  return (
    <div className="space-y-3 pb-4 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Checkbox
          id={day.key}
          checked={dayData.available}
          onCheckedChange={() => onToggleDay(day.key)}
        />
        <Label htmlFor={day.key} className="font-semibold text-base">
          {day.label}
        </Label>
      </div>

      {dayData.available && (
        <div className="ml-8 space-y-2">
          <div className="flex flex-wrap gap-2">
            {dayData.slots.map((slot) => {
              const slotWithId = slot as TimeSlotWithId
              return (
                <TimeSlotInput
                  key={slotWithId.id}
                  slot={slotWithId}
                  onStartChange={(value) => onUpdateSlot(day.key, slotWithId.id, 'start', value)}
                  onEndChange={(value) => onUpdateSlot(day.key, slotWithId.id, 'end', value)}
                  onRemove={() => onRemoveSlot(day.key, slotWithId.id)}
                />
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddSlot(day.key)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un créneau
          </Button>
        </div>
      )}
    </div>
  )
}
