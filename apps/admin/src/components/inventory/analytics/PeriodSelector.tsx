'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PeriodSelectorProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onPreset: (preset: string) => void
}

const PRESETS = [
  { label: 'Mois', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Annee', value: 'year' },
]

export function PeriodSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPreset,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3">
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => onPreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="space-y-1">
          <Label htmlFor="start" className="text-xs">Du</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-36 h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end" className="text-xs">Au</Label>
          <Input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-36 h-9"
          />
        </div>
      </div>
    </div>
  )
}
