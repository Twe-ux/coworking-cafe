import { useState, useEffect, useCallback } from 'react'
import { cachedFetch, getCacheKey, inventoryCache } from '@/lib/inventory/cache'
import type { Product, ProductFormData, APIResponse } from '@/types/inventory'

interface UseProductFilters {
  search?: string
  category?: string
  supplierId?: string
  lowStock?: boolean
  active?: boolean
}

interface UseProductReturn {
  products: Product[]
  loading: boolean
  error: string | null
  lowStockCount: number
  createProduct: (data: ProductFormData) => Promise<boolean>
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  fetchLowStock: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to manage products CRUD operations and alerts
 * @param filters - Optional filters (search, category, supplier, lowStock)
 */
export function useProducts(filters?: UseProductFilters): UseProductReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  /**
   * Fetch products from API (with caching)
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const paramObj: Record<string, string | undefined> = {}
      if (filters?.search) paramObj.search = filters.search
      if (filters?.category) paramObj.category = filters.category
      if (filters?.supplierId) paramObj.supplierId = filters.supplierId
      if (filters?.lowStock !== undefined) paramObj.lowStock = String(filters.lowStock)
      if (filters?.active !== undefined) paramObj.active = String(filters.active)

      const cacheKey = getCacheKey('/api/inventory/products', paramObj)

      // Use cached fetch
      const data = await cachedFetch<Product[]>(cacheKey)

      if (data) {
        setProducts(data)
      } else {
        setError('Erreur lors du chargement des produits')
      }
    } catch (err) {
      console.error('[useProducts] Fetch error:', err)
      setError('Erreur réseau lors du chargement')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.category, filters?.supplierId, filters?.lowStock, filters?.active])

  /**
   * Fetch low stock products count
   */
  const fetchLowStock = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/products/low-stock')
      const data = (await res.json()) as APIResponse<{
        products: Product[]
        count: number
      }>

      if (data.success && data.data) {
        setLowStockCount(data.data.count)
      }
    } catch (err) {
      console.error('[useProducts] Fetch low stock error:', err)
    }
  }, [])

  /**
   * Create a new product
   */
  const createProduct = async (data: ProductFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = (await res.json()) as APIResponse<Product>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('products')
        await fetchProducts()
        await fetchLowStock()
        return true
      } else {
        setError(result.error || 'Erreur lors de la création')
        return false
      }
    } catch (err) {
      console.error('[useProducts] Create error:', err)
      setError('Erreur réseau lors de la création')
      return false
    }
  }

  /**
   * Update an existing product
   */
  const updateProduct = async (
    id: string,
    data: Partial<ProductFormData>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = (await res.json()) as APIResponse<Product>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('products')
        await fetchProducts()
        await fetchLowStock()
        return true
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
        return false
      }
    } catch (err) {
      console.error('[useProducts] Update error:', err)
      setError('Erreur réseau lors de la mise à jour')
      return false
    }
  }

  /**
   * Delete (soft delete) a product
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/products/${id}`, {
        method: 'DELETE',
      })

      const result = (await res.json()) as APIResponse<{ message: string }>

      if (result.success) {
        // Invalidate cache and refetch
        inventoryCache.invalidatePattern('products')
        await fetchProducts()
        await fetchLowStock()
        return true
      } else {
        setError(result.error || 'Erreur lors de la suppression')
        return false
      }
    } catch (err) {
      console.error('[useProducts] Delete error:', err)
      setError('Erreur réseau lors de la suppression')
      return false
    }
  }

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts()
    fetchLowStock()
  }, [fetchProducts, fetchLowStock])

  return {
    products,
    loading,
    error,
    lowStockCount,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchLowStock,
    refetch: fetchProducts,
  }
}
