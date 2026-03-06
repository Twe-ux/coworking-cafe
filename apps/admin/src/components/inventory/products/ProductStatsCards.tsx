'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UtensilsCrossed,
  Sparkles,
  Package,
  FileText,
  Shapes,
  Layers,
} from 'lucide-react'
import type { Product, ProductCategory } from '@/types/inventory'

const CATEGORY_CARDS = [
  { key: 'food' as ProductCategory, label: 'Alimentation', icon: UtensilsCrossed, ringClass: 'ring-orange-500', iconClass: 'text-orange-500' },
  { key: 'cleaning' as ProductCategory, label: 'Entretien', icon: Sparkles, ringClass: 'ring-blue-500', iconClass: 'text-blue-500' },
  { key: 'emballage' as ProductCategory, label: 'Emballage', icon: Package, ringClass: 'ring-amber-500', iconClass: 'text-amber-500' },
  { key: 'papeterie' as ProductCategory, label: 'Papeterie', icon: FileText, ringClass: 'ring-purple-500', iconClass: 'text-purple-500' },
  { key: 'divers' as ProductCategory, label: 'Divers', icon: Shapes, ringClass: 'ring-gray-500', iconClass: 'text-gray-500' },
] as const

interface ProductStatsCardsProps {
  products: Product[]
  selectedCategory: ProductCategory | 'all'
  onSelectCategory: (category: ProductCategory | 'all') => void
}

export function ProductStatsCards({
  products,
  selectedCategory,
  onSelectCategory,
}: ProductStatsCardsProps) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = { total: products.length }
    for (const cat of CATEGORY_CARDS) {
      counts[cat.key] = products.filter((p) => p.category === cat.key).length
    }
    return counts
  }, [products])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {CATEGORY_CARDS.map(({ key, label, icon: Icon, ringClass, iconClass }) => (
        <Card
          key={key}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === key ? `ring-2 ${ringClass}` : ''
          }`}
          onClick={() => onSelectCategory(selectedCategory === key ? 'all' : key)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={`w-4 h-4 ${iconClass}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[key]}</div>
            <p className="text-xs text-muted-foreground">
              produit{stats[key] !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Total card */}
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedCategory === 'all' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => onSelectCategory('all')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Layers className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            produit{stats.total !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
