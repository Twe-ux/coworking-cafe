import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { SpaceFormData } from "./types"

interface PricingSectionProps {
  formData: SpaceFormData
  onPricingChange: (type: keyof SpaceFormData["pricing"], value: number) => void
  onPerPersonChange: (value: boolean) => void
}

/**
 * Pricing configuration section
 * Shows pricing inputs based on enabled reservation types
 */
export function PricingSection({
  formData,
  onPricingChange,
  onPerPersonChange,
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
    <div className="space-y-4">
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

      {/* Prix par personne */}
      <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/50">
        <Checkbox
          id="per-person"
          checked={formData.pricing.perPerson}
          onCheckedChange={(checked) => onPerPersonChange(checked === true)}
        />
        <div className="flex flex-col">
          <Label
            htmlFor="per-person"
            className="cursor-pointer font-medium"
          >
            Tarification par personne
          </Label>
          <p className="text-sm text-muted-foreground">
            Activer le sélecteur de nombre de personnes dans le formulaire de réservation
          </p>
        </div>
      </div>
    </div>
  )
}
