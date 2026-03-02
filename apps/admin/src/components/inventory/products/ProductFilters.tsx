'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Supplier } from '@/types/inventory'

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search?: string
    category?: string
    supplierId?: string
    lowStock?: boolean
    active?: boolean
  }) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [supplierId, setSupplierId] = useState<string>('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  // Fetch suppliers for filter
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch('/api/inventory/suppliers?active=true')
        const data = await res.json()
        if (data.success && data.data) {
          setSuppliers(data.data)
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      }
    }
    fetchSuppliers()
  }, [])

  const applyFilters = (params: {
    search: string
    category: string
    supplierId: string
    lowStock: boolean
    activeStatus: string
  }) => {
    const filters: {
      search?: string
      category?: string
      supplierId?: string
      lowStock?: boolean
      active?: boolean
    } = {}

    if (params.search) filters.search = params.search
    if (params.category !== 'all') filters.category = params.category
    if (params.supplierId !== 'all') filters.supplierId = params.supplierId
    if (params.lowStock) filters.lowStock = true
    if (params.activeStatus !== 'all') {
      filters.active = params.activeStatus === 'active'
    }

    onFilterChange(filters)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    applyFilters({ search: value, category, supplierId, lowStock: lowStockOnly, activeStatus })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    applyFilters({ search, category: value, supplierId, lowStock: lowStockOnly, activeStatus })
  }

  const handleSupplierChange = (value: string) => {
    setSupplierId(value)
    applyFilters({ search, category, supplierId: value, lowStock: lowStockOnly, activeStatus })
  }

  const handleLowStockChange = (checked: boolean) => {
    setLowStockOnly(checked)
    applyFilters({ search, category, supplierId, lowStock: checked, activeStatus })
  }

  const handleActiveStatusChange = (value: string) => {
    setActiveStatus(value)
    applyFilters({ search, category, supplierId, lowStock: lowStockOnly, activeStatus: value })
  }

  const handleReset = () => {
    setSearch('')
    setCategory('all')
    setSupplierId('all')
    setLowStockOnly(false)
    setActiveStatus('all')
    onFilterChange({})
  }

  const hasFilters =
    search ||
    category !== 'all' ||
    supplierId !== 'all' ||
    lowStockOnly ||
    activeStatus !== 'all'

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category */}
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="food">Alimentation</SelectItem>
              <SelectItem value="cleaning">Entretien</SelectItem>
            </SelectContent>
          </Select>

          {/* Supplier */}
          <Select value={supplierId} onValueChange={handleSupplierChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Fournisseur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous fournisseurs</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active Status */}
          <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>

          {/* Low Stock Checkbox */}
          <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
            <Checkbox
              id="lowStock"
              checked={lowStockOnly}
              onCheckedChange={handleLowStockChange}
            />
            <label
              htmlFor="lowStock"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Stock faible
            </label>
          </div>

          {/* Reset */}
          {hasFilters && (
            <Button variant="outline" onClick={handleReset}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
