'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface DateDisplayProps {
  date: Date | string
}

/**
 * Displays the selected date for the shift
 */
export function DateDisplay({ date }: DateDisplayProps) {
  const displayDate = typeof date === 'string'
    ? new Date(date + 'T12:00:00')
    : date

  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="font-medium">
            {displayDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
