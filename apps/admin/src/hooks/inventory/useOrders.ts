import { useState, useEffect, useCallback } from 'react'
import type {
  PurchaseOrder,
  OrderStatus,
  APIResponse,
} from '@/types/inventory'

interface UseOrdersFilters {
  status?: OrderStatus
  supplierId?: string
  startDate?: string
  endDate?: string
}

interface UseOrdersReturn {
  orders: PurchaseOrder[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrders(filters?: UseOrdersFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.supplierId) params.set('supplierId', filters.supplierId)
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)

      const res = await fetch(`/api/inventory/purchase-orders?${params}`)
      const data = (await res.json()) as APIResponse<PurchaseOrder[]>

      if (data.success && data.data) {
        setOrders(data.data)
      } else {
        setError(data.error || 'Erreur lors du chargement des commandes')
      }
    } catch (err) {
      console.error('[useOrders] Fetch error:', err)
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.supplierId, filters?.startDate, filters?.endDate])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  }
}
