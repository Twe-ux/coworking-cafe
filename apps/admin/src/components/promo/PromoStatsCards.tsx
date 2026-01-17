import { Card } from '@/components/ui/card'
import { QrCode, Eye, Copy, Clock } from 'lucide-react'
import type { ScanStats } from '@/types/promo'

/**
 * Affiche 4 cartes de statistiques pour le système de code promo
 *
 * @param scanStats - Statistiques des scans QR code
 */
interface PromoStatsCardsProps {
  scanStats?: ScanStats
}

export function PromoStatsCards({ scanStats }: PromoStatsCardsProps) {
  // Si scanStats est undefined, afficher des valeurs par défaut
  if (!scanStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: 0, icon: QrCode, color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { label: 'Total Reveals', value: 0, icon: Eye, color: 'text-purple-600', bgColor: 'bg-purple-50' },
          { label: 'Total Copies', value: 0, icon: Copy, color: 'text-green-600', bgColor: 'bg-green-50' },
          { label: 'Avg. Time to Reveal', value: '0s', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Scans',
      value: scanStats.totalScans,
      icon: QrCode,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Reveals',
      value: scanStats.totalReveals,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Copies',
      value: scanStats.totalCopies,
      icon: Copy,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg. Time to Reveal',
      value: `${Math.round(scanStats.averageTimeToReveal)}s`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
