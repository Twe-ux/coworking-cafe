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

interface SupplierFiltersProps {
  onFilterChange: (filters: {
    search?: string
    category?: string
    active?: boolean
  }) => void
}

export function SupplierFilters({ onFilterChange }: SupplierFiltersProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [activeStatus, setActiveStatus] = useState<string>('active')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    applyFilters({ search: value, category, activeStatus })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    applyFilters({ search, category: value, activeStatus })
  }

  const handleActiveStatusChange = (value: string) => {
    setActiveStatus(value)
    applyFilters({ search, category, activeStatus: value })
  }

  const applyFilters = (params: {
    search: string
    category: string
    activeStatus: string
  }) => {
    const filters: {
      search?: string
      category?: string
      active?: boolean
    } = {}

    if (params.search) {
      filters.search = params.search
    }

    if (params.category !== 'all') {
      filters.category = params.category
    }

    if (params.activeStatus !== 'all') {
      filters.active = params.activeStatus === 'active'
    }

    onFilterChange(filters)
  }

  const handleReset = () => {
    setSearch('')
    setCategory('all')
    setActiveStatus('active')
    onFilterChange({ active: true })
  }

  // Apply default filter on mount (show only active suppliers)
  useEffect(() => {
    onFilterChange({ active: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="food">Alimentation</SelectItem>
            <SelectItem value="cleaning">Entretien</SelectItem>
            <SelectItem value="emballage">Emballage</SelectItem>
            <SelectItem value="papeterie">Papeterie</SelectItem>
            <SelectItem value="divers">Divers</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Status Filter */}
        <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {(search || category !== 'all' || activeStatus !== 'all') && (
          <Button
            variant="outline"
            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}
