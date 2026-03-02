'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnalytics } from '@/hooks/inventory/useAnalytics'
import { useProducts } from '@/hooks/inventory/useProducts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  StockValueCard, CARatioCard, ConsumptionTrendChart,
  SupplierBreakdownChart, TopProductsTable, PeriodSelector,
} from '@/components/inventory/analytics'

function getDefaultPeriod() {
  const now = new Date()
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { startDate: start, endDate: end }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState(getDefaultPeriod)
  const { stockValue, caRatio, consumptionTrends, supplierPerformance, loading, error } =
    useAnalytics(period)

  // Memoize filter to prevent infinite loop
  const lowStockFilter = useMemo(() => ({ lowStock: true }), [])
  const { lowStockCount } = useProducts(lowStockFilter)

  const handlePreset = useCallback((preset: string) => {
    const now = new Date()
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    let start: string

    if (preset === 'month') {
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    } else if (preset === 'quarter') {
      const qMonth = now.getMonth() - 2
      const qDate = new Date(now.getFullYear(), qMonth, 1)
      start = `${qDate.getFullYear()}-${String(qDate.getMonth() + 1).padStart(2, '0')}-01`
    } else {
      start = `${now.getFullYear()}-01-01`
    }

    setPeriod({ startDate: start, endDate: end })
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/inventory')} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" /> Analytics Inventaire
          </h1>
        </div>
        <PeriodSelector
          startDate={period.startDate} endDate={period.endDate}
          onStartDateChange={(d) => setPeriod((p) => ({ ...p, startDate: d }))}
          onEndDateChange={(d) => setPeriod((p) => ({ ...p, endDate: d }))}
          onPreset={handlePreset}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-3 py-2 rounded text-sm">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StockValueCard data={stockValue} loading={loading} />
        <CARatioCard data={caRatio} loading={loading} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Alertes stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {lowStockCount} produit{lowStockCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-1">sous le seuil minimum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fournisseurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {supplierPerformance?.suppliers.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsumptionTrendChart
          topConsumed={consumptionTrends?.topConsumed || []}
          loading={loading}
        />
        <SupplierBreakdownChart
          suppliers={supplierPerformance?.suppliers || []}
          loading={loading}
        />
      </div>

      {/* Trends table */}
      <TopProductsTable
        trends={consumptionTrends?.trends || []}
        loading={loading}
      />
    </div>
  )
}
