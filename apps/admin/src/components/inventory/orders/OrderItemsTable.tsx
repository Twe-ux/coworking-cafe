import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { PurchaseOrderItem } from '@/types/inventory'

interface DisplayItem {
  productId: string
  productName: string
  quantity: number
  packagingType: string
  unitPriceHT: number
}

interface OrderItemsTableProps {
  items: PurchaseOrderItem[] | DisplayItem[]
  editable?: boolean
  onRemove?: (productId: string) => void
  onQuantityChange?: (productId: string, quantity: number) => void
}

export function OrderItemsTable({
  items,
  editable = false,
  onRemove,
  onQuantityChange,
}: OrderItemsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead className="text-center">Quantité</TableHead>
            <TableHead className="text-center">Unité</TableHead>
            <TableHead className="text-right">Prix HT</TableHead>
            <TableHead className="text-right">Total HT</TableHead>
            {editable && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={editable ? 6 : 5} className="text-center text-muted-foreground">
                Aucun produit ajouté
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const total = item.quantity * item.unitPriceHT
              return (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-center font-mono">
                    {editable && onQuantityChange ? (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val) && val > 0) {
                            onQuantityChange(item.productId, val)
                          }
                        }}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell className="text-center">{item.packagingType}</TableCell>
                  <TableCell className="text-right font-mono">
                    {item.unitPriceHT.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {total.toFixed(2)} €
                  </TableCell>
                  {editable && onRemove && (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemove(item.productId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
