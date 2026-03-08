'use client'

import { PackageCheck, TrendingDown, Euro } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface InventoryValorizationCardProps {
  stockFinalValue: number
  consumptionValue: number
  totalValue: number
  loading?: boolean
}

export function InventoryValorizationCard({
  stockFinalValue,
  consumptionValue,
  totalValue,
  loading,
}: InventoryValorizationCardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stock Final */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <PackageCheck className="h-4 w-4" />
            Stock Final Valorisé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {stockFinalValue.toFixed(2)} €
          </div>
          <p className="text-xs text-green-600 mt-1">
            Dernier prix unitaire × quantité finale
          </p>
        </CardContent>
      </Card>

      {/* Consumption */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Consommation Valorisée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {consumptionValue.toFixed(2)} €
          </div>
          <p className="text-xs text-blue-600 mt-1">
            CUMP × quantité consommée
          </p>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="border-gray-200 bg-gray-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Valorisation Totale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {totalValue.toFixed(2)} €
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Stock final + Consommation
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
