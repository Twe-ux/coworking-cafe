'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface LowStockBadgeProps {
  currentStock: number
  minStock: number
}

export function LowStockBadge({ currentStock, minStock }: LowStockBadgeProps) {
  const isLowStock = currentStock < minStock

  if (!isLowStock) return null

  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      Stock faible
    </Badge>
  )
}
