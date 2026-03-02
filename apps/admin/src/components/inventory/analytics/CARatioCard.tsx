'use client'

import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { CARatioResponse } from '@/types/inventory'

interface CARatioCardProps {
  data: CARatioResponse | null
  loading: boolean
}

const STATUS_CONFIG = {
  good: { label: 'Bon', variant: 'default' as const, color: 'text-green-600' },
  warning: { label: 'Attention', variant: 'secondary' as const, color: 'text-yellow-600' },
  critical: { label: 'Critique', variant: 'destructive' as const, color: 'text-destructive' },
}

export function CARatioCard({ data, loading }: CARatioCardProps) {
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

  const status = data?.status || 'good'
  const config = STATUS_CONFIG[status]
  // Progress bar: 0-10 scale, ideal is 3-6
  const progressValue = Math.min((data?.rotationRate || 0) / 10 * 100, 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Rotation stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <p className={`text-2xl font-bold ${config.color}`}>
            {data?.rotationRate || 0}x
          </p>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <Progress value={progressValue} className="mt-2 h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          CA: {(data?.ca || 0).toFixed(0)} EUR / Stock: {(data?.stockValue || 0).toFixed(0)} EUR
        </p>
      </CardContent>
    </Card>
  )
}
