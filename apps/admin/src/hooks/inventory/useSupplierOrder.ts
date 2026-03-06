import { useState, useEffect, useCallback, useRef } from 'react'
import type { Supplier, APIResponse } from '@/types/inventory'

/**
 * Hook to manage supplier display order for drag&drop reordering.
 * Fetches active suppliers on mount to get their order field,
 * and provides a reorder function to persist new order via API.
 */
export function useSupplierOrder() {
  const [orderMap, setOrderMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function fetchOrders() {
      try {
        const res = await fetch('/api/inventory/suppliers?active=true')
        const result = (await res.json()) as APIResponse<Supplier[]>
        if (result.success && result.data) {
          const map: Record<string, number> = {}
          for (const s of result.data) {
            map[s._id] = s.order ?? 999
          }
          setOrderMap(map)
        }
      } catch (err) {
        console.error('[useSupplierOrder] Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getOrder = useCallback(
    (supplierId: string): number => orderMap[supplierId] ?? 999,
    [orderMap]
  )

  const reorder = useCallback(async (supplierIds: string[]) => {
    // Optimistic local update
    const newMap: Record<string, number> = {}
    supplierIds.forEach((id, index) => { newMap[id] = index })
    setOrderMap((prev) => ({ ...prev, ...newMap }))

    // Persist to API (fire-and-forget, order already updated locally)
    try {
      await fetch('/api/inventory/suppliers/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierIds }),
      })
    } catch (err) {
      console.error('[useSupplierOrder] Reorder error:', err)
    }
  }, [])

  return { getOrder, reorder, orderLoading: loading }
}
