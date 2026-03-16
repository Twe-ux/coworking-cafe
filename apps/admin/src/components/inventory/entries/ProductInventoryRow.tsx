'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
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
          <Input
            type="number"
            min={0}
            step={0.1}
            value={item.actualQty || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                onQuantityChange(item.productId, 0);
              } else {
                // Accept both comma and dot as decimal separator
                const normalizedValue = value.replace(',', '.');
                const val = parseFloat(normalizedValue);
                onQuantityChange(item.productId, isNaN(val) ? 0 : val);
              }
            }}
            onFocus={(e) => {
              // Safari fix: setTimeout to prevent auto-deselect
              setTimeout(() => e.target.select(), 0);
            }}
            onMouseUp={(e) => {
              // Prevent Safari from deselecting on mouse up
              e.preventDefault();
            }}
            className="w-24 mx-auto text-center font-mono"
            placeholder="0"
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
