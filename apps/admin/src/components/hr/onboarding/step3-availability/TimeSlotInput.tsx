import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import type { TimeSlotWithId } from './types'

/**
 * Props for TimeSlotInput component
 */
interface TimeSlotInputProps {
  slot: TimeSlotWithId
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onRemove: () => void
}

/**
 * Time slot input component for start/end times
 */
export function TimeSlotInput({ slot, onStartChange, onEndChange, onRemove }: TimeSlotInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={slot.start}
        onChange={(e) => onStartChange(e.target.value)}
        className="w-28"
      />
      <span className="text-muted-foreground text-sm">à</span>
      <Input
        type="time"
        value={slot.end}
        onChange={(e) => onEndChange(e.target.value)}
        className="w-28"
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
