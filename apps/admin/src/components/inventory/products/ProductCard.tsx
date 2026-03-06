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
    <div className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-all hover:shadow-sm ${
      !product.isActive ? 'opacity-60 bg-muted/30' : ''
    }`}>
      {/* Product info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{product.name}</span>
          {!product.isActive && (
            <Badge variant="destructive" className="text-xs">Inactif</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[product.category]}</Badge>
          {product.hasShortDLC && (
            <Badge variant="outline" className="text-xs">DLC courte</Badge>
          )}
        </div>
      </div>

      {/* Stock info */}
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-medium">{stockDisplay}</p>
        <LowStockBadge currentStock={product.currentStock} minStock={product.minStock} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-blue-500 text-blue-700 hover:bg-blue-50"
          onClick={() => onEdit(product)}
          title="Modifier"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        {product.isActive ? (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-red-500 text-red-700 hover:bg-red-50"
            onClick={() => onDeactivate(product)}
            title="Désactiver"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-green-500 text-green-700 hover:bg-green-50"
            onClick={() => onReactivate(product._id)}
            title="Réactiver"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
