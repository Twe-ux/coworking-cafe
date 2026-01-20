'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock } from 'lucide-react'

interface TimeSelectorProps {
  startTime: string
  endTime: string
  startTimeError?: string
  endTimeError?: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

/**
 * Time input fields for start and end times
 */
export function TimeSelector({
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  onStartTimeChange,
  onEndTimeChange,
}: TimeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Start Time */}
      <div className="space-y-2">
        <Label htmlFor="startTime">Heure de debut *</Label>
        <div className="relative">
          <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={`pl-9 ${startTimeError ? 'border-red-500' : ''}`}
          />
        </div>
        {startTimeError && (
          <p className="text-sm text-red-500">{startTimeError}</p>
        )}
      </div>

      {/* End Time */}
      <div className="space-y-2">
        <Label htmlFor="endTime">Heure de fin *</Label>
        <div className="relative">
          <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={`pl-9 ${endTimeError ? 'border-red-500' : ''}`}
          />
        </div>
        {endTimeError && (
          <p className="text-sm text-red-500">{endTimeError}</p>
        )}
      </div>
    </div>
  )
}
