import { useState, useEffect, useCallback } from 'react'
import type {
  StockValueResponse,
  CARatioResponse,
  ConsumptionTrendsResponse,
  SupplierPerformanceResponse,
  APIResponse,
} from '@/types/inventory'

interface AnalyticsPeriod {
  startDate: string
  endDate: string
}

interface UseAnalyticsReturn {
  stockValue: StockValueResponse | null
  caRatio: CARatioResponse | null
  consumptionTrends: ConsumptionTrendsResponse | null
  supplierPerformance: SupplierPerformanceResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

async function fetchAPI<T>(url: string): Promise<T | null> {
  const res = await fetch(url)
  const data = (await res.json()) as APIResponse<T>
  if (data.success && data.data) return data.data
  return null
}

/**
 * Hook to fetch all analytics data in parallel
 */
export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsReturn {
  const [stockValue, setStockValue] = useState<StockValueResponse | null>(null)
  const [caRatio, setCaRatio] = useState<CARatioResponse | null>(null)
  const [consumptionTrends, setConsumptionTrends] =
    useState<ConsumptionTrendsResponse | null>(null)
  const [supplierPerformance, setSupplierPerformance] =
    useState<SupplierPerformanceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = `startDate=${period.startDate}&endDate=${period.endDate}`

      const [sv, cr, ct, sp] = await Promise.all([
        fetchAPI<StockValueResponse>('/api/inventory/analytics/stock-value'),
        fetchAPI<CARatioResponse>(
          `/api/inventory/analytics/ca-ratio?${params}`
        ),
        fetchAPI<ConsumptionTrendsResponse>(
          '/api/inventory/analytics/consumption-trends?months=6'
        ),
        fetchAPI<SupplierPerformanceResponse>(
          '/api/inventory/analytics/supplier-performance'
        ),
      ])

      setStockValue(sv)
      setCaRatio(cr)
      setConsumptionTrends(ct)
      setSupplierPerformance(sp)
    } catch (err) {
      console.error('[useAnalytics] Fetch error:', err)
      setError('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }, [period.startDate, period.endDate])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    stockValue,
    caRatio,
    consumptionTrends,
    supplierPerformance,
    loading,
    error,
    refetch: fetchAll,
  }
}
