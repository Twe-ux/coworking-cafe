import { useState, useEffect, useCallback } from 'react'
import type { PurchaseOrder, APIResponse } from '@/types/inventory'

interface UseOrderReturn {
  order: PurchaseOrder | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrder(id: string | null): UseOrderReturn {
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/purchase-orders/${id}`)
      const data = (await res.json()) as APIResponse<PurchaseOrder>

      if (data.success && data.data) {
        setOrder(data.data)
      } else {
        setError(data.error || 'Commande introuvable')
      }
    } catch (err) {
      console.error('[useOrder] Fetch error:', err)
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  }
}
