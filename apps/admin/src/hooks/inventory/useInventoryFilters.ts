import { useState, useCallback } from 'react'
import type {
  InventoryEntryItem,
  Product,
  ProductCategory,
} from '@/types/inventory'

interface UseInventoryFiltersReturn {
  search: string
  category: ProductCategory | ''
  supplierId: string
  setSearch: (value: string) => void
  setCategory: (value: ProductCategory | '') => void
  setSupplierId: (value: string) => void
  filterItems: (
    items: InventoryEntryItem[],
    productsMap: Map<string, Product>
  ) => InventoryEntryItem[]
  resetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Hook to manage filters for inventory entry items.
 * Supports search by product name, category filter, and supplier filter.
 * Uses a productsMap to cross-reference item data with product metadata.
 */
export function useInventoryFilters(): UseInventoryFiltersReturn {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | ''>('')
  const [supplierId, setSupplierId] = useState('')

  const hasActiveFilters = search !== '' || category !== '' || supplierId !== ''

  const filterItems = useCallback(
    (
      items: InventoryEntryItem[],
      productsMap: Map<string, Product>
    ): InventoryEntryItem[] => {
      if (!hasActiveFilters) return items

      return items.filter((item) => {
        // Search by product name
        if (search && !item.productName.toLowerCase().includes(search.toLowerCase())) {
          return false
        }

        const product = productsMap.get(item.productId)

        // Filter by category (requires product data)
        if (category && product?.category !== category) {
          return false
        }

        // Filter by supplier (requires product data)
        if (supplierId && product?.supplierId !== supplierId) {
          return false
        }

        return true
      })
    },
    [search, category, supplierId, hasActiveFilters]
  )

  const resetFilters = useCallback(() => {
    setSearch('')
    setCategory('')
    setSupplierId('')
  }, [])

  return {
    search,
    category,
    supplierId,
    setSearch,
    setCategory,
    setSupplierId,
    filterItems,
    resetFilters,
    hasActiveFilters,
  }
}
