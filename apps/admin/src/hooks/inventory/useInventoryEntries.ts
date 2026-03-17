import { useState, useEffect, useCallback } from 'react'
import type {
  InventoryEntry,
  InventoryType,
  APIResponse,
} from '@/types/inventory'

interface UseInventoryEntriesFilters {
  status?: 'draft' | 'finalized'
  type?: InventoryType
  startDate?: string
  endDate?: string
}

interface UseInventoryEntriesReturn {
  entries: InventoryEntry[]
  loading: boolean
  error: string | null
  deleteEntry: (id: string) => Promise<boolean>
  unfinalizeEntry: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage inventory entries list (history)
 */
export function useInventoryEntries(
  filters?: UseInventoryEntriesFilters
): UseInventoryEntriesReturn {
  const [entries, setEntries] = useState<InventoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.type) params.set('type', filters.type)
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)

      const res = await fetch(`/api/inventory/entries?${params}`)
      const data = (await res.json()) as APIResponse<InventoryEntry[]>

      if (data.success && data.data) {
        setEntries(data.data)
      } else {
        setError(data.error || 'Erreur lors du chargement des inventaires')
      }
    } catch (err) {
      console.error('[useInventoryEntries] Fetch error:', err)
      setError('Erreur reseau lors du chargement')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.type, filters?.startDate, filters?.endDate])

  const deleteEntry = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/entries/${id}`, {
        method: 'DELETE',
      })
      const result = (await res.json()) as APIResponse<{ deleted: boolean }>

      if (result.success) {
        await fetchEntries()
        return true
      } else {
        setError(result.error || 'Erreur lors de la suppression')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntries] Delete error:', err)
      setError('Erreur reseau lors de la suppression')
      return false
    }
  }

  const unfinalizeEntry = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/entries/${id}/unfinalize`, {
        method: 'POST',
      })
      const result = (await res.json()) as APIResponse<InventoryEntry>

      if (result.success) {
        return true
      } else {
        setError(result.error || 'Erreur lors de la définalisation')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntries] Unfinalize error:', err)
      setError('Erreur reseau lors de la définalisation')
      return false
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    loading,
    error,
    deleteEntry,
    unfinalizeEntry,
    refetch: fetchEntries,
  }
}
