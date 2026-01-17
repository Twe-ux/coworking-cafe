import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Graphique en barres des scans des 7 derniers jours
 *
 * @param weeklyStats - Données des scans par jour
 */
interface PromoWeeklyChartProps {
  weeklyStats: Array<{
    date: string
    scans: number
  }>
}

export function PromoWeeklyChart({ weeklyStats }: PromoWeeklyChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  }

  const chartData = weeklyStats.map((stat) => ({
    date: formatDate(stat.date),
    scans: stat.scans,
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Scans des 7 derniers jours</h3>
      {weeklyStats.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="scans" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
