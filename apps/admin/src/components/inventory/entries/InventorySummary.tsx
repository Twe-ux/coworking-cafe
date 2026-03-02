'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryEntryItem } from '@/types/inventory'

interface InventorySummaryProps {
  items: InventoryEntryItem[]
  totalVarianceValue: number
}

export function InventorySummary({
  items,
  totalVarianceValue,
}: InventorySummaryProps) {
  const countedItems = items.filter((i) => i.actualQty > 0)
  const negativeVariances = items.filter(
    (i) => i.actualQty > 0 && i.actualQty - i.theoreticalQty < 0
  )
  const positiveVariances = items.filter(
    (i) => i.actualQty > 0 && i.actualQty - i.theoreticalQty > 0
  )

  const negativeTotal = negativeVariances.reduce(
    (sum, i) => sum + (i.actualQty - i.theoreticalQty) * i.unitPriceHT,
    0
  )
  const positiveTotal = positiveVariances.reduce(
    (sum, i) => sum + (i.actualQty - i.theoreticalQty) * i.unitPriceHT,
    0
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Produits inventories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {countedItems.length} / {items.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ecarts negatifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">
            {negativeVariances.length} ({negativeTotal.toFixed(2)} EUR)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ecarts positifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {positiveVariances.length} (+{positiveTotal.toFixed(2)} EUR)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ecart total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${
            totalVarianceValue < 0
              ? 'text-destructive'
              : totalVarianceValue > 0
                ? 'text-green-600'
                : ''
          }`}>
            {totalVarianceValue > 0 ? '+' : ''}{totalVarianceValue.toFixed(2)} EUR
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
