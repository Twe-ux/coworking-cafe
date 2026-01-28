"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Users } from "lucide-react"
import type { PeopleSectionProps } from "./types"

export function PeopleSection({
  numberOfPeople,
  onChange,
  min = 1,
  max = 50,
  error,
}: PeopleSectionProps) {
  const handleIncrement = () => {
    if (numberOfPeople < max) {
      onChange(numberOfPeople + 1)
    }
  }

  const handleDecrement = () => {
    if (numberOfPeople > min) {
      onChange(numberOfPeople - 1)
    }
  }

  return (
    <div className="space-y-3">
      <Label>Nombre de personnes *</Label>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={numberOfPeople <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center gap-2 min-w-[120px] px-4 py-2 border rounded-md bg-muted/50">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-semibold">{numberOfPeople}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={numberOfPeople >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
