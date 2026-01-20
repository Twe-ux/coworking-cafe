import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SpaceFormData } from "./types"

interface CapacitySectionProps {
  formData: SpaceFormData
  onMinCapacityChange: (value: number) => void
  onMaxCapacityChange: (value: number) => void
}

/**
 * Capacity configuration section
 * Allows setting minimum and maximum capacity
 */
export function CapacitySection({
  formData,
  onMinCapacityChange,
  onMaxCapacityChange,
}: CapacitySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minCapacity">Capacité minimale *</Label>
        <Input
          id="minCapacity"
          type="number"
          min={1}
          value={formData.minCapacity}
          onChange={(e) => onMinCapacityChange(parseInt(e.target.value))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxCapacity">Capacité maximale *</Label>
        <Input
          id="maxCapacity"
          type="number"
          min={1}
          value={formData.maxCapacity}
          onChange={(e) => onMaxCapacityChange(parseInt(e.target.value))}
          required
        />
      </div>
    </div>
  )
}
