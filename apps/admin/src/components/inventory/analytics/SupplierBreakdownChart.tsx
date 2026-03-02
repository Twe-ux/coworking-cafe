'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SupplierPerformanceItem } from '@/types/inventory'

interface SupplierBreakdownChartProps {
  suppliers: SupplierPerformanceItem[]
  loading: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function SupplierBreakdownChart({
  suppliers,
  loading,
}: SupplierBreakdownChartProps) {
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

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Repartition par fournisseur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Aucun fournisseur avec du stock
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = suppliers.map((s) => ({
    name: s.supplierName,
    value: s.stockValue,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Repartition par fournisseur</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${Number(value || 0).toFixed(2)} EUR`, 'Stock']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
