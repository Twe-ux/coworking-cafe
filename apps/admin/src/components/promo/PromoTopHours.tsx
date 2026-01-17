import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock } from 'lucide-react'

/**
 * Affiche les heures de pic d'activité avec barres de progression
 *
 * @param topHours - Top heures avec statistiques
 */
interface PromoTopHoursProps {
  topHours: Array<{
    hour: string
    count: number
    percentage: number
  }>
}

export function PromoTopHours({ topHours }: PromoTopHoursProps) {
  if (topHours.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Heures de pic</h3>
        <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Heures de pic</h3>
      </div>
      <div className="space-y-4">
        {topHours.map((hourData) => (
          <div key={hourData.hour}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{hourData.hour}:00</span>
              <span className="text-sm text-gray-600">
                {hourData.count} scans ({hourData.percentage}%)
              </span>
            </div>
            <Progress value={hourData.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  )
}
