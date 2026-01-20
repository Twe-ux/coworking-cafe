/**
 * Component to display the selected date
 */

import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DateDisplayProps } from './types'

export function DateDisplay({ date }: DateDisplayProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="font-medium">
            {date.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Europe/Paris',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
