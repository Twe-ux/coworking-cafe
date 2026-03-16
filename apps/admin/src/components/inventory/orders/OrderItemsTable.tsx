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
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={'realStock' in item ? item.realStock ?? '' : ''}
                              placeholder="Stock"
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '') {
                                  // Allow clearing the field - set to undefined to show placeholder
                                  onRealStockChange(item.productId, undefined)
                                } else {
                                  // Accept both comma and dot as decimal separator
                                  const normalizedValue = value.replace(',', '.')
                                  const val = parseFloat(normalizedValue)
                                  if (!isNaN(val) && val >= 0) {
                                    onRealStockChange(item.productId, val)
                                  }
                                }
                              }}
                              onFocus={(e) => {
                                // Safari fix: setTimeout to prevent auto-deselect
                                setTimeout(() => e.target.select(), 0)
                              }}
                              onMouseUp={(e) => {
                                // Prevent Safari from deselecting on mouse up
                                e.preventDefault()
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.currentTarget.value = ''
                                  onRealStockChange(item.productId, undefined)
                                }
                              }}
                              className="w-20 min-h-[44px] px-2 py-2 border rounded text-center font-mono touch-manipulation"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{'realStock' in item ? item.realStock ?? '-' : '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50">
                        {editable && onQuantityChange ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={item.quantity || ''}
                              placeholder="Qté"
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '') {
                                  // Allow clearing the field
                                  onQuantityChange(item.productId, 0)
                                } else {
                                  // Accept both comma and dot as decimal separator
                                  const normalizedValue = value.replace(',', '.')
                                  const val = parseFloat(normalizedValue)
                                  if (!isNaN(val) && val >= 0) {
                                    onQuantityChange(item.productId, val)
                                  }
                                }
                              }}
                              onFocus={(e) => {
                                // Safari fix: setTimeout to prevent auto-deselect
                                setTimeout(() => e.target.select(), 0)
                              }}
                              onMouseUp={(e) => {
                                // Prevent Safari from deselecting on mouse up
                                e.preventDefault()
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.currentTarget.value = ''
                                  onQuantityChange(item.productId, 0)
                                }
                              }}
                              className="w-20 min-h-[44px] px-2 py-2 border rounded text-center font-mono touch-manipulation"
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
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => {
                              // Accept both comma and dot as decimal separator
                              const normalizedValue = e.target.value.replace(',', '.')
                              const val = parseFloat(normalizedValue)
                              if (!isNaN(val) && val >= 0) {
                                onQuantityChange(item.productId, val)
                              }
                            }}
                            onFocus={(e) => {
                              // Safari fix: setTimeout to prevent auto-deselect
                              setTimeout(() => e.target.select(), 0)
                            }}
                            onMouseUp={(e) => {
                              // Prevent Safari from deselecting on mouse up
                              e.preventDefault()
                            }}
                            className="w-20 px-2 py-1 border rounded text-center"
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
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => {
                              // Accept both comma and dot as decimal separator
                              const normalizedValue = e.target.value.replace(',', '.')
                              const val = parseFloat(normalizedValue)
                              if (!isNaN(val) && val >= 0) {
                                onQuantityChange(item.productId, val)
                              }
                            }}
                            onFocus={(e) => {
                              // Safari fix: setTimeout to prevent auto-deselect
                              setTimeout(() => e.target.select(), 0)
                            }}
                            onMouseUp={(e) => {
                              // Prevent Safari from deselecting on mouse up
                              e.preventDefault()
                            }}
                            className="w-20 px-2 py-1 border rounded text-center font-mono mr-2"
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
