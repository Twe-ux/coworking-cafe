'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/inventory/categoryColors'
import type { ProductCategory } from '@/types/inventory'

const CATEGORY_CARDS = [
  { key: 'food' as ProductCategory, ...CATEGORY_COLORS.food },
  { key: 'cleaning' as ProductCategory, ...CATEGORY_COLORS.cleaning },
  { key: 'emballage' as ProductCategory, ...CATEGORY_COLORS.emballage },
  { key: 'papeterie' as ProductCategory, ...CATEGORY_COLORS.papeterie },
  { key: 'divers' as ProductCategory, ...CATEGORY_COLORS.divers },
] as const

interface CategoryFilterProps {
  categoryCounts: Record<string, number>
  totalCount: number
  selectedCategory: ProductCategory | 'all'
  onSelectCategory: (category: ProductCategory | 'all') => void
}

export function CategoryFilter({
  categoryCounts,
  totalCount,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {CATEGORY_CARDS.map(({ key, label, icon: Icon, border, ring, iconColor }) => (
        <Card
          key={key}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === key ? `border-2 ${border}` : ''
          }`}
          onClick={() => onSelectCategory(selectedCategory === key ? 'all' : key)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts[key] || 0}</div>
            <p className="text-xs text-muted-foreground">
              produit{(categoryCounts[key] || 0) !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      ))}

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedCategory === 'all' ? 'border-2 border-primary' : ''
        }`}
        onClick={() => onSelectCategory('all')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Layers className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            produit{totalCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
