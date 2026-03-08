'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TopConsumedProduct } from '@/types/inventory'

interface ConsumptionTrendChartProps {
  topConsumed: TopConsumedProduct[]
  loading: boolean
}

export function ConsumptionTrendChart({
  topConsumed,
  loading,
}: ConsumptionTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (topConsumed.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top produits consommes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Pas de donnees de consommation disponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for chart - truncate long names
  const chartData = topConsumed.map((p) => ({
    name: p.productName.length > 15
      ? p.productName.substring(0, 15) + '...'
      : p.productName,
    quantite: p.totalConsumed,
    valeur: p.totalValue,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 10 produits consommes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} fontSize={12} />
            <Tooltip
              formatter={(value, name) => [
                name === 'quantite'
                  ? `${value} unites`
                  : `${Number(value || 0).toFixed(2)} EUR`,
                name === 'quantite' ? 'Quantite' : 'Valeur',
              ]}
            />
            <Legend />
            <Bar dataKey="quantite" fill="#3b82f6" name="Quantite" />
            <Bar dataKey="valeur" fill="#10b981" name="Valeur (EUR)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
