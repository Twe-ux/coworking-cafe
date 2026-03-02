'use client'

import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { StockValueResponse } from '@/types/inventory'

interface StockValueCardProps {
  data: StockValueResponse | null
  loading: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Alimentation',
  cleaning: 'Entretien',
}

export function StockValueCard({ data, loading }: StockValueCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          Valeur stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {(data?.totalValue || 0).toFixed(2)} EUR
        </p>
        {data?.breakdown && data.breakdown.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground mt-1 cursor-help underline-offset-2 underline decoration-dotted">
                  {data.breakdown.map((b) =>
                    `${CATEGORY_LABELS[b.category] || b.category}: ${b.value.toFixed(0)} EUR`
                  ).join(' | ')}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                {data.breakdown.map((b) => (
                  <p key={b.category}>
                    {CATEGORY_LABELS[b.category] || b.category}: {b.products} produits, {b.value.toFixed(2)} EUR
                  </p>
                ))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
