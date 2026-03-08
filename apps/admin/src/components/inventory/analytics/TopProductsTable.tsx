'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConsumptionTrendItem } from '@/types/inventory'

interface TopProductsTableProps {
  trends: ConsumptionTrendItem[]
  loading: boolean
}

const TREND_CONFIG = {
  up: { label: 'En hausse', variant: 'destructive' as const },
  down: { label: 'En baisse', variant: 'default' as const },
  stable: { label: 'Stable', variant: 'secondary' as const },
}

export function TopProductsTable({ trends, loading }: TopProductsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendances par produit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Pas de donnees de tendances disponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort by avgMonthly descending
  const sorted = [...trends].sort((a, b) => b.avgMonthly - a.avgMonthly).slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tendances consommation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-center">Moy. mensuelle</TableHead>
                <TableHead className="text-center">Tendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => {
                const config = TREND_CONFIG[t.trend]
                return (
                  <TableRow key={t.productId}>
                    <TableCell className="font-medium">{t.productName}</TableCell>
                    <TableCell className="text-center font-mono">
                      {t.avgMonthly}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
