import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { SpaceFormData } from "./types"

interface ReservationTypesSectionProps {
  formData: SpaceFormData
  onReservationTypeChange: (type: keyof SpaceFormData["availableReservationTypes"], checked: boolean) => void
}

/**
 * Available reservation types section
 * Allows selecting hourly, daily, weekly, monthly options
 */
export function ReservationTypesSection({
  formData,
  onReservationTypeChange,
}: ReservationTypesSectionProps) {
  const reservationTypes = [
    { id: "hourly", label: "Horaire" },
    { id: "daily", label: "Journée" },
    { id: "weekly", label: "Semaine" },
    { id: "monthly", label: "Mois" },
  ] as const

  return (
    <div className="space-y-3">
      <Label>Types de réservation disponibles</Label>
      <div className="space-y-2">
        {reservationTypes.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={formData.availableReservationTypes[id]}
              onCheckedChange={(checked) =>
                onReservationTypeChange(id, checked === true)
              }
            />
            <Label htmlFor={id} className="font-normal">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
