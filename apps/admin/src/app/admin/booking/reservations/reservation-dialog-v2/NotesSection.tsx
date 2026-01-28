"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { NotesSectionProps } from "./types"

export function NotesSection({ notes, onChange }: NotesSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes (optionnel)</Label>
      <Textarea
        id="notes"
        placeholder="Ajouter des notes concernant cette réservation..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-none"
      />
    </div>
  )
}
