"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NotesSectionProps } from "./types";

export function NotesSection({ notes, onChange, spaceId }: NotesSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes (optionnel)</Label>
      <Textarea
        id="notes"
        placeholder="Ajouter des notes concernant cette réservation..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={spaceId === "evenementiel" ? 5 : 10}
        className="resize-none"
      />
    </div>
  );
}
