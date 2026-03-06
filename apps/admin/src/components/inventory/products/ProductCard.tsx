'use client'

import { Edit, Trash2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LowStockBadge } from './LowStockBadge'
import { formatStock } from '@/lib/inventory/stockHelpers'
import type { Product } from '@/types/inventory'

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Alimentation',
  cleaning: 'Entretien',
  emballage: 'Emballage',
  papeterie: 'Papeterie',
  divers: 'Divers',
}

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDeactivate: (product: Product) => void
  onReactivate: (id: string) => Promise<boolean>
}

export function ProductCard({ product, onEdit, onDeactivate, onReactivate }: ProductCardProps) {
  const stockDisplay = formatStock(
    product.currentStock,
    product.packagingType,
    product.unitsPerPackage,
    product.minStockUnit
  )

  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-1.5 hover:bg-muted/50 rounded-sm transition-colors ${
      !product.isActive ? 'opacity-60' : ''
    }`}>
      {/* Product info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-medium text-sm truncate">{product.name}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{CATEGORY_LABELS[product.category]}</Badge>
        {product.hasShortDLC && <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">DLC</Badge>}
        {!product.isActive && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">Inactif</Badge>}
      </div>

      {/* Stock + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-mono text-muted-foreground">{stockDisplay}</span>
        <LowStockBadge currentStock={product.currentStock} minStock={product.minStock} />
        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="icon"
            className="h-7 w-7 border-blue-500 text-blue-700 hover:bg-blue-50"
            onClick={() => onEdit(product)} title="Modifier"
          >
            <Edit className="h-3 w-3" />
          </Button>
          {product.isActive ? (
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 border-red-500 text-red-700 hover:bg-red-50"
              onClick={() => onDeactivate(product)} title="Désactiver"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="outline" size="icon"
              className="h-7 w-7 border-green-500 text-green-700 hover:bg-green-50"
              onClick={() => onReactivate(product._id)} title="Réactiver"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
