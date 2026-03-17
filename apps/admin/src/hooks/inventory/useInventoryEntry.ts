import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  InventoryEntry,
  InventoryType,
  UpdateInventoryItemData,
  APIResponse,
} from '@/types/inventory'

interface InventoryMetadata {
  type?: InventoryType
  date?: string
  title?: string
}

interface UseInventoryEntryReturn {
  entry: InventoryEntry | null
  loading: boolean
  error: string | null
  saving: boolean
  finalizing: boolean
  unfinalizing: boolean
  handleQuantityChange: (productId: string, actualQuantity: number) => void
  updateMetadata: (metadata: InventoryMetadata) => Promise<boolean>
  saveAll: (title?: string) => Promise<boolean>
  finalize: () => Promise<boolean>
  unfinalize: () => Promise<boolean>
  refetch: () => Promise<void>
}

/**
 * Hook to manage a single inventory entry (detail, update quantities, finalize)
 * Includes debounced auto-save for quantity changes
 */
export function useInventoryEntry(id: string | null): UseInventoryEntryReturn {
  const [entry, setEntry] = useState<InventoryEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [unfinalizing, setUnfinalizing] = useState(false)
  const pendingUpdates = useRef<Map<string, number>>(new Map())
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEntry = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/entries/${id}`)
      const data = (await res.json()) as APIResponse<InventoryEntry>

      if (data.success && data.data) {
        setEntry(data.data)
      } else {
        setError(data.error || "Erreur lors du chargement de l'inventaire")
      }
    } catch (err) {
      console.error('[useInventoryEntry] Fetch error:', err)
      setError('Erreur reseau lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [id])

  const updateQuantities = useCallback(async (
    items: UpdateInventoryItemData[]
  ): Promise<boolean> => {
    if (!id || items.length === 0) return false
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const result = (await res.json()) as APIResponse<InventoryEntry>

      if (result.success && result.data) {
        setEntry(result.data)
        return true
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntry] Update error:', err)
      setError('Erreur reseau lors de la sauvegarde')
      return false
    } finally {
      setSaving(false)
    }
  }, [id])

  // Debounced auto-save: triggers 1s after last quantity change
  const debouncedSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      const items = Array.from(pendingUpdates.current.entries()).map(
        ([productId, actualQuantity]) => ({ productId, actualQuantity })
      )
      if (items.length > 0) {
        updateQuantities(items)
        pendingUpdates.current.clear()
      }
    }, 1000)
  }, [updateQuantities])

  const handleQuantityChange = useCallback((
    productId: string,
    actualQuantity: number
  ) => {
    // Optimistic update: update local state immediately
    setEntry((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.productId === productId
            ? { ...item, actualQty: actualQuantity }
            : item
        ),
      }
    })

    // Queue for debounced save
    pendingUpdates.current.set(productId, actualQuantity)
    debouncedSave()
  }, [debouncedSave])

  // Update metadata (type, date, title) - only for draft entries
  const updateMetadata = useCallback(async (
    metadata: InventoryMetadata
  ): Promise<boolean> => {
    if (!id) return false
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      })

      const result = (await res.json()) as APIResponse<InventoryEntry>

      if (result.success && result.data) {
        setEntry(result.data)
        return true
      } else {
        setError(result.error || 'Erreur lors de la mise a jour')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntry] Update metadata error:', err)
      setError('Erreur reseau lors de la mise a jour')
      return false
    } finally {
      setSaving(false)
    }
  }, [id])

  // Save all items (manual save or pre-finalize)
  const saveAll = useCallback(async (title?: string): Promise<boolean> => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (!entry) return false

    // Update title if provided
    if (title !== undefined && title !== entry.title) {
      const metadataSuccess = await updateMetadata({ title })
      if (!metadataSuccess) return false
    }

    const items = entry.items.map((item) => ({
      productId: item.productId,
      actualQuantity: pendingUpdates.current.has(item.productId)
        ? pendingUpdates.current.get(item.productId)!
        : item.actualQty,
    }))

    pendingUpdates.current.clear()
    return updateQuantities(items)
  }, [entry, updateQuantities, updateMetadata])

  const finalize = useCallback(async (): Promise<boolean> => {
    if (!id) return false
    // Save pending changes first
    await saveAll()

    setFinalizing(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/entries/${id}/finalize`, {
        method: 'POST',
      })
      const result = (await res.json()) as APIResponse<InventoryEntry>

      if (result.success && result.data) {
        setEntry(result.data)
        return true
      } else {
        setError(result.error || 'Erreur lors de la finalisation')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntry] Finalize error:', err)
      setError('Erreur reseau lors de la finalisation')
      return false
    } finally {
      setFinalizing(false)
    }
  }, [id, saveAll])

  const unfinalize = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    setUnfinalizing(true)
    setError(null)

    try {
      const res = await fetch(`/api/inventory/entries/${id}/unfinalize`, {
        method: 'POST',
      })
      const result = (await res.json()) as APIResponse<InventoryEntry>

      if (result.success && result.data) {
        setEntry(result.data)
        return true
      } else {
        setError(result.error || 'Erreur lors de la définalisation')
        return false
      }
    } catch (err) {
      console.error('[useInventoryEntry] Unfinalize error:', err)
      setError('Erreur reseau lors de la définalisation')
      return false
    } finally {
      setUnfinalizing(false)
    }
  }, [id])

  useEffect(() => {
    fetchEntry()
  }, [fetchEntry])

  return {
    entry,
    loading,
    error,
    saving,
    finalizing,
    unfinalizing,
    handleQuantityChange,
    updateMetadata,
    saveAll,
    finalize,
    unfinalize,
    refetch: fetchEntry,
  }
}
