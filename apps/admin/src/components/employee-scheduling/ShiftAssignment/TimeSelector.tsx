/**
 * Time selection component for shift start and end times
 */

import { Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TimeSelectorProps } from './types'

export function TimeSelector({
  startTime,
  endTime,
  startError,
  endError,
  onStartTimeChange,
  onEndTimeChange,
}: TimeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time *</Label>
        <div className="relative">
          <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={`pl-9 ${startError ? 'border-red-500' : ''}`}
          />
        </div>
        {startError && (
          <p className="text-sm text-red-500">{startError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End Time *</Label>
        <div className="relative">
          <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={`pl-9 ${endError ? 'border-red-500' : ''}`}
          />
        </div>
        {endError && (
          <p className="text-sm text-red-500">{endError}</p>
        )}
      </div>
    </div>
  )
}
