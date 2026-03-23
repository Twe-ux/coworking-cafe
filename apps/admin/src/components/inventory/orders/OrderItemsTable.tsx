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
import { NumberInput } from '@/components/inventory/NumberInput'
import type { PurchaseOrderItem } from '@/types/inventory'

interface DisplayItem {
  productId: string
  productName: string
  quantity: number
  packagingType: string
  unitPriceHT: number
  minStock?: number
  maxStock?: number
  currentStock?: number
  realStock?: number
  unitsPerPackage?: number
}

interface OrderItemsTableProps {
  items: PurchaseOrderItem[] | DisplayItem[]
  editable?: boolean
  showStockInfo?: boolean // Afficher les colonnes de stock
  onRemove?: (productId: string) => void
  onQuantityChange?: (productId: string, quantity: number) => void
  onRealStockChange?: (productId: string, realStock: number | undefined) => void
}

export function OrderItemsTable({
  items,
  editable = false,
  showStockInfo = false,
  onRemove,
  onQuantityChange,
  onRealStockChange,
}: OrderItemsTableProps) {
  // Calculate colspan based on mode
  // editable + showStockInfo: 8 columns (Produit, Stock Réel, Commande prev, Sep, Commande, Prix, Total, Actions)
  // editable + !showStockInfo: 6 columns (Produit, Quantité stock, Sep, Commande, Prix, Total, Actions) - NOT USED
  // !editable + showStockInfo: 7 columns (Produit, Stock Réel, Commande prev, Sep, Commande, Prix, Total)
  // !editable + !showStockInfo: 4 columns (Produit, Commande, Prix, Total) - READ-ONLY DETAIL MODE
  const colSpan = editable
    ? (showStockInfo ? 8 : 6)
    : (showStockInfo ? 7 : 4)

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            {showStockInfo && (
              <>
                <TableHead className="text-center bg-blue-50">Stock Réel</TableHead>
                <TableHead className="text-center bg-blue-50">Commande prévisionnel</TableHead>
                <TableHead className="border-l-2 border-muted"></TableHead>
              </>
            )}
            {!showStockInfo && editable && (
              <>
                <TableHead className="text-center">Quantité en stock / Unité</TableHead>
                <TableHead className="border-l-2 border-muted"></TableHead>
              </>
            )}
            <TableHead className="text-center">Commande</TableHead>
            <TableHead className="text-right">Prix HT / Unité</TableHead>
            <TableHead className="text-right">Total HT</TableHead>
            {editable && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                Aucun produit ajouté
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              // Calculate total: if pack, multiply by unitsPerPackage
              const unitsPerPack = ('unitsPerPackage' in item ? item.unitsPerPackage : undefined) ?? 1
              const pricePerItem = item.packagingType === 'pack'
                ? item.unitPriceHT * unitsPerPack
                : item.unitPriceHT
              const total = item.quantity * pricePerItem

              // Show pack info if it's a pack type
              const unitDisplay = item.packagingType === 'pack'
                ? 'pack'
                : 'Unité(s)'
              const packInfo = item.packagingType === 'pack' && unitsPerPack > 1
                ? `(${unitsPerPack}/pack)`
                : ''
              return (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  {showStockInfo && (
                    <>
                      <TableCell className="text-center bg-blue-50">
                        {editable && onRealStockChange ? (
                          <div className="flex items-center justify-center gap-1">
                            <NumberInput
                              value={'realStock' in item ? (item.realStock ?? 0) : 0}
                              onChange={(val) => onRealStockChange(item.productId, val)}
                              min={0}
                              step="0.1"
                              placeholder="Stock"
                              className="w-20 min-h-[44px] text-center font-mono touch-manipulation"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{'realStock' in item ? (item.realStock ?? 0) : 0}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50">
                        {editable && onQuantityChange ? (
                          <div className="flex items-center justify-center gap-1">
                            <NumberInput
                              value={item.quantity || 0}
                              onChange={(val) => onQuantityChange(item.productId, val)}
                              min={0}
                              step="0.1"
                              placeholder="Qté"
                              className="w-20 min-h-[44px] text-center font-mono touch-manipulation"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{item.quantity || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="border-l-2 border-muted"></TableCell>
                    </>
                  )}
                  {!showStockInfo && editable && (
                    <>
                      <TableCell className="text-center font-mono">
                        {onQuantityChange ? (
                          <NumberInput
                            value={item.quantity}
                            onChange={(val) => onQuantityChange(item.productId, val)}
                            min={0}
                            step="0.1"
                            className="w-20 text-center"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell className="border-l-2 border-muted"></TableCell>
                    </>
                  )}
                  <TableCell className="text-center">
                    {showStockInfo ? (
                      <>
                        <span className="font-mono font-medium mr-2">{item.quantity}</span>
                        <span>{unitDisplay}</span>
                        {packInfo && <div className="text-xs text-muted-foreground">{packInfo}</div>}
                      </>
                    ) : (
                      <>
                        {editable && onQuantityChange ? (
                          <NumberInput
                            value={item.quantity}
                            onChange={(val) => onQuantityChange(item.productId, val)}
                            min={0}
                            step="0.1"
                            className="w-20 text-center font-mono mr-2 inline-block"
                          />
                        ) : (
                          <span className="font-mono mr-2">{item.quantity}</span>
                        )}
                        <span>{unitDisplay}</span>
                        {packInfo && <div className="text-xs text-muted-foreground">{packInfo}</div>}
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {pricePerItem.toFixed(2)} €
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
