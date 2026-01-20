"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DateTimeSectionProps } from "./types"

/**
 * Section des dates et heures de réservation
 */
export function DateTimeSection({ formData, onChange }: DateTimeSectionProps) {
  const isHourlyReservation = formData.reservationType === "hourly"

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            required
          />
        </div>
      </div>

      {isHourlyReservation && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Heure de début</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => onChange("startTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Heure de fin</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => onChange("endTime", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="numberOfPeople">Nombre de personnes *</Label>
        <Input
          id="numberOfPeople"
          type="number"
          min={1}
          value={formData.numberOfPeople}
          onChange={(e) => onChange("numberOfPeople", e.target.value)}
          required
        />
      </div>
    </>
  )
}
