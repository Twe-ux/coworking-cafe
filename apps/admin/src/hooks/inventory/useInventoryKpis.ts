import { useEffect, useState } from 'react'
import type { Product, APIResponse, StockValueResponse } from '@/types/inventory'

export interface InventoryKpiData {
  totalProducts: number
  stockValue: number
  lowStockCount: number
  loading: boolean
}

export function useInventoryKpis(): InventoryKpiData {
  const [data, setData] = useState<InventoryKpiData>({
    totalProducts: 0,
    stockValue: 0,
    lowStockCount: 0,
    loading: true,
  })

  useEffect(() => {
    async function fetchKpis() {
      try {
        const [productsRes, stockRes] = await Promise.all([
          fetch('/api/inventory/products'),
          fetch('/api/inventory/analytics/stock-value'),
        ])

        const productsData = (await productsRes.json()) as APIResponse<Product[]>
        const stockData = (await stockRes.json()) as APIResponse<StockValueResponse>

        const products = productsData.data || []
        const active = products.filter((p) => p.isActive)

        setData({
          totalProducts: active.length,
          stockValue: stockData.data?.totalValue || 0,
          lowStockCount: active.filter((p) => p.currentStock < p.minStock).length,
          loading: false,
        })
      } catch {
        setData((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchKpis()
  }, [])

  return data
}
