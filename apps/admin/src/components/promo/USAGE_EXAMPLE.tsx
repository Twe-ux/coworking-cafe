/**
 * EXEMPLE D'UTILISATION des composants Promo
 *
 * Ce fichier montre comment utiliser tous les composants ensemble
 * dans une page admin.
 *
 * IMPORTANT : Ce fichier est un EXEMPLE, ne pas l'importer dans l'app.
 */

'use client'

import { usePromo } from '@/hooks/usePromo'
import {
  PromoStatsCards,
  PromoCurrentCode,
  PromoHistory,
  PromoWeeklyChart,
  PromoTopHours,
} from '@/components/promo'

export function PromoPageExample() {
  // Hook personnalisé pour récupérer toutes les données
  const { promoData, loading, error } = usePromo()

  if (loading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div>Erreur : {error}</div>
  }

  if (!promoData) {
    return <div>Aucune configuration trouvée</div>
  }

  // Transformer scansByDay en format pour le graphique
  const weeklyStats = Object.entries(promoData.scanStats.scansByDay)
    .map(([date, scans]) => ({ date, scans: Number(scans) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7) // 7 derniers jours

  // Calculer les heures de pic
  const topHours = Object.entries(promoData.scanStats.scansByHour)
    .map(([hour, count]) => ({
      hour,
      count: Number(count),
      percentage: Math.round((Number(count) / promoData.scanStats.totalScans) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 heures

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Code Promo</h1>
        <p className="text-gray-600">Gérez votre code promo et suivez les statistiques</p>
      </div>

      {/* Statistiques principales */}
      <PromoStatsCards scanStats={promoData.scanStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code actuel */}
        <PromoCurrentCode promoCode={promoData.current} />

        {/* Heures de pic */}
        <PromoTopHours topHours={topHours} />
      </div>

      {/* Graphique hebdomadaire */}
      <PromoWeeklyChart weeklyStats={weeklyStats} />

      {/* Historique */}
      <PromoHistory history={promoData.history} maxItems={10} />
    </div>
  )
}

/**
 * EXEMPLE AVEC DONNÉES STATIQUES (pour tester sans API)
 */
export function PromoPageMockExample() {
  const mockData = {
    scanStats: {
      totalScans: 145,
      totalReveals: 98,
      totalCopies: 67,
      conversionRateReveal: 67.6,
      conversionRateCopy: 68.4,
      averageTimeToReveal: 12,
      scansByDay: {
        '2026-01-10': 18,
        '2026-01-11': 22,
        '2026-01-12': 25,
        '2026-01-13': 20,
        '2026-01-14': 19,
        '2026-01-15': 23,
        '2026-01-16': 18,
      },
      scansByHour: {
        '09': 8,
        '10': 15,
        '11': 12,
        '12': 10,
        '13': 8,
        '14': 25,
        '15': 20,
        '16': 18,
        '17': 15,
        '18': 10,
        '19': 4,
      },
    },
    current: {
      code: 'HIVER2026',
      token: 'abc123',
      description: 'Promotion hiver - 20% sur toutes les réservations',
      discountType: 'percentage' as const,
      discountValue: 20,
      validFrom: '2026-01-01',
      validUntil: '2026-03-31',
      maxUses: 100,
      currentUses: 45,
      isActive: true,
      createdAt: '2026-01-01 10:00',
    },
    history: [
      {
        code: 'NOEL2025',
        token: 'def456',
        description: 'Promotion Noël 2025',
        discountType: 'percentage' as const,
        discountValue: 25,
        validFrom: '2025-12-01',
        validUntil: '2025-12-31',
        totalUses: 87,
        deactivatedAt: '2025-12-31 23:59',
      },
      {
        code: 'AUTOMNE2025',
        token: 'ghi789',
        description: 'Promotion automne 2025',
        discountType: 'fixed' as const,
        discountValue: 15,
        validFrom: '2025-09-01',
        validUntil: '2025-11-30',
        totalUses: 62,
        deactivatedAt: '2025-11-30 23:59',
      },
    ],
  }

  // Transformer les données pour les composants
  const weeklyStats = Object.entries(mockData.scanStats.scansByDay).map(([date, scans]) => ({
    date,
    scans,
  }))

  const topHours = Object.entries(mockData.scanStats.scansByHour)
    .map(([hour, count]) => ({
      hour,
      count,
      percentage: Math.round((count / mockData.scanStats.totalScans) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Code Promo (Démo)</h1>
        <p className="text-gray-600">Exemple avec données fictives</p>
      </div>

      <PromoStatsCards scanStats={mockData.scanStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromoCurrentCode promoCode={mockData.current} />
        <PromoTopHours topHours={topHours} />
      </div>

      <PromoWeeklyChart weeklyStats={weeklyStats} />
      <PromoHistory history={mockData.history} />
    </div>
  )
}
