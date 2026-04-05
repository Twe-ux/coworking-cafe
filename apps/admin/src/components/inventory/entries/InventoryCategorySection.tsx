'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductInventoryInput } from './ProductInventoryInput'
import type { InventoryEntryItem, Product, ProductCategory } from '@/types/inventory'

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Alimentation',
  cleaning: 'Entretien',
  emballage: 'Emballage',
  papeterie: 'Papeterie',
  divers: 'Divers',
}

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  food: 'border-orange-500 bg-orange-50 text-orange-700',
  cleaning: 'border-blue-500 bg-blue-50 text-blue-700',
  emballage: 'border-purple-500 bg-purple-50 text-purple-700',
  papeterie: 'border-pink-500 bg-pink-50 text-pink-700',
  divers: 'border-gray-500 bg-gray-50 text-gray-700',
}

interface InventoryCategorySectionProps {
  category: ProductCategory
  items: InventoryEntryItem[]
  productsMap: Map<string, Product>
  isFinalized: boolean
  onQuantityChange: (productId: string, actualQuantity: number) => void
}

export function InventoryCategorySection({
  category,
  items,
  productsMap,
  isFinalized,
  onQuantityChange,
}: InventoryCategorySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-sm px-3 py-1 pointer-events-none ${
            CATEGORY_BADGE_CLASSES[category] || CATEGORY_BADGE_CLASSES.divers
          }`}
        >
          {CATEGORY_LABELS[category] || category}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {items.length} produit{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-center">Type & Conditionnement</TableHead>
              <TableHead className="text-center">Quantité réelle</TableHead>
              <TableHead className="text-center">Écart</TableHead>
              <TableHead className="text-right">Valeur écart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const product = productsMap.get(item.productId)
              return (
                <ProductInventoryInput
                  key={item.productId}
                  item={item}
                  packagingType={product?.packagingType ?? 'unit'}
                  unitsPerPackage={product?.unitsPerPackage ?? 1}
                  packageUnit={product?.packageUnit}
                  isFinalized={isFinalized}
                  onQuantityChange={onQuantityChange}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
