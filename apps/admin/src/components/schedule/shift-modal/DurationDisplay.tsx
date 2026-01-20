'use client'

import { Clock } from 'lucide-react'

interface DurationDisplayProps {
  duration: string
}

/**
 * Displays calculated shift duration
 */
export function DurationDisplay({ duration }: DurationDisplayProps) {
  if (!duration) return null

  return (
    <div className="rounded-lg bg-blue-50 p-3">
      <div className="flex items-center gap-2 text-blue-800">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          Duree: {duration}
        </span>
      </div>
    </div>
  )
}
