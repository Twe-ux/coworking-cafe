'use client'

import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { NumberInput } from '@/components/inventory/NumberInput'
import type { InventoryEntryItem } from '@/types/inventory'

interface ProductInventoryRowProps {
  item: InventoryEntryItem
  isFinalized: boolean
  onQuantityChange: (productId: string, actualQuantity: number) => void
}

export function ProductInventoryRow({
  item,
  isFinalized,
  onQuantityChange,
}: ProductInventoryRowProps) {
  const variance = item.actualQty - item.theoreticalQty
  const varianceValue = variance * item.unitPriceHT
  const hasBeenCounted = item.actualQty > 0 || isFinalized

  return (
    <TableRow>
      <TableCell className="font-medium">
        {item.productName}
      </TableCell>
      <TableCell className="text-center font-mono">
        {item.theoreticalQty}
      </TableCell>
      <TableCell className="text-center">
        {isFinalized ? (
          <span className="font-mono">{item.actualQty}</span>
        ) : (
          <NumberInput
            value={item.actualQty || 0}
            onChange={(val) => onQuantityChange(item.productId, val)}
            min={0}
            step="0.1"
            placeholder="0"
            className="w-24 mx-auto text-center font-mono"
          />
        )}
      </TableCell>
      <TableCell className="text-center">
        {hasBeenCounted && (
          <Badge
            variant={variance < 0 ? 'destructive' : variance > 0 ? 'default' : 'secondary'}
          >
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right font-mono">
        {hasBeenCounted && (
          <span className={
            varianceValue < 0
              ? 'text-destructive'
              : varianceValue > 0
                ? 'text-green-600'
                : ''
          }>
            {varianceValue > 0 ? '+' : ''}{varianceValue.toFixed(2)} EUR
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}
