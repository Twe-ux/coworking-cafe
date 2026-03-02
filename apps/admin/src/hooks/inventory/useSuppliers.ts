import { useState, useEffect, useCallback } from 'react'
import { cachedFetch, getCacheKey, inventoryCache } from '@/lib/inventory/cache'
import type { Supplier, SupplierFormData, APIResponse } from '@/types/inventory'

interface UseSupplierFilters {
  search?: string
  category?: string
  active?: boolean
}

interface UseSupplierReturn {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  createSupplier: (data: SupplierFormData) => Promise<boolean>
  updateSupplier: (id: string, data: Partial<SupplierFormData>) => Promise<boolean>
  deleteSupplier: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

/**
 * Hook to manage suppliers CRUD operations
 * @param filters - Optional filters (search, category, active)
 */
export function useSuppliers(filters?: UseSupplierFilters): UseSupplierReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch suppliers from API (with caching)
   */
  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const paramObj: Record<string, string | undefined> = {}
      if (filters?.search) paramObj.search = filters.search
      if (filters?.category) paramObj.category = filters.category
      if (filters?.active !== undefined) paramObj.active = String(filters.active)

      const cacheKey = getCacheKey('/api/inventory/suppliers', paramObj)

      // Use cached fetch
      const data = await cachedFetch<Supplier[]>(cacheKey)

      if (data) {
        setSuppliers(data)
      } else {
        setError('Erreur lors du chargement des fournisseurs')
      }
    } catch (err) {
      console.error('[useSuppliers] Fetch error:', err)
      setError('Erreur réseau lors du chargement')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.category, filters?.active])

  /**
   * Create a new supplier
   */
  const createSupplier = async (data: SupplierFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = (await res.json()) as APIResponse<Supplier>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('suppliers')
        await fetchSuppliers()
        return true
      } else {
        setError(result.error || 'Erreur lors de la création')
        return false
      }
    } catch (err) {
      console.error('[useSuppliers] Create error:', err)
      setError('Erreur réseau lors de la création')
      return false
    }
  }

  /**
   * Update an existing supplier
   */
  const updateSupplier = async (
    id: string,
    data: Partial<SupplierFormData>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = (await res.json()) as APIResponse<Supplier>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('suppliers')
        await fetchSuppliers()
        return true
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
        return false
      }
    } catch (err) {
      console.error('[useSuppliers] Update error:', err)
      setError('Erreur réseau lors de la mise à jour')
      return false
    }
  }

  /**
   * Delete (soft delete) a supplier
   */
  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'DELETE',
      })

      const result = (await res.json()) as APIResponse<{ message: string }>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('suppliers')
        await fetchSuppliers()
        return true
      } else {
        setError(result.error || 'Erreur lors de la suppression')
        return false
      }
    } catch (err) {
      console.error('[useSuppliers] Delete error:', err)
      setError('Erreur réseau lors de la suppression')
      return false
    }
  }

  // Fetch suppliers on mount and when filters change
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  }
}
