import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SpaceFormData } from "./types"

interface PricingSectionProps {
  formData: SpaceFormData
  onPricingChange: (type: keyof SpaceFormData["pricing"], value: number) => void
}

/**
 * Pricing configuration section
 * Shows pricing inputs based on enabled reservation types
 */
export function PricingSection({
  formData,
  onPricingChange,
}: PricingSectionProps) {
  const pricingFields = [
    { key: "hourly", label: "Tarif horaire", enabled: formData.availableReservationTypes.hourly },
    { key: "daily", label: "Tarif journée", enabled: formData.availableReservationTypes.daily },
    { key: "weekly", label: "Tarif semaine", enabled: formData.availableReservationTypes.weekly },
    { key: "monthly", label: "Tarif mois", enabled: formData.availableReservationTypes.monthly },
  ] as const

  const enabledFields = pricingFields.filter((field) => field.enabled)

  if (enabledFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <Label>Tarifs (€)</Label>
      <div className="grid grid-cols-2 gap-4">
        {enabledFields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${key}-price`}>{label}</Label>
            <Input
              id={`${key}-price`}
              type="number"
              min={0}
              step={0.01}
              value={formData.pricing[key]}
              onChange={(e) => onPricingChange(key, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
