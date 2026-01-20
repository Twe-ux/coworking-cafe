"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SpaceSelectionSectionProps } from "./types"
import type { ReservationType } from "@/types/booking"

/**
 * Section de sélection de l'espace et du type de réservation
 */
export function SpaceSelectionSection({ formData, spaces, onChange }: SpaceSelectionSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="spaceId">Espace *</Label>
        <Select
          value={formData.spaceId}
          onValueChange={(value) => onChange("spaceId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un espace" />
          </SelectTrigger>
          <SelectContent>
            {spaces
              .filter((space) => space.isActive)
              .map((space) => (
                <SelectItem key={space._id} value={space._id || ""}>
                  {space.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reservationType">Type de réservation *</Label>
        <Select
          value={formData.reservationType}
          onValueChange={(value: ReservationType) => onChange("reservationType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Horaire</SelectItem>
            <SelectItem value="daily">Journée</SelectItem>
            <SelectItem value="weekly">Semaine</SelectItem>
            <SelectItem value="monthly">Mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
