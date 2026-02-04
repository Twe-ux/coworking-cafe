"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TimeSectionProps } from "./types";

export function TimeSection({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
}: TimeSectionProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="space-y-3">
          <Label htmlFor="start-time">Heure de début *</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* End Time */}
        <div className="space-y-3">
          <Label htmlFor="end-time">Heure de fin *</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Espace réservé pour équilibrer avec le texte descriptif de DateSection */}
      <div className="min-h-[32px]">
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
