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
  const colSpan = editable ? (showStockInfo ? 6 : 6) : (showStockInfo ? 5 : 5)

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
            {!showStockInfo && <TableHead className="text-center">Quantité</TableHead>}
            <TableHead className="text-center">Commande réel</TableHead>
            <TableHead className="text-right">Prix HT</TableHead>
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
              const total = item.quantity * item.unitPriceHT
              // Show pack info if it's a pack type
              const unitDisplay = item.packagingType === 'pack' && item.unitsPerPackage
                ? `${item.packagingType}`
                : item.packagingType
              const packInfo = item.packagingType === 'pack' && item.unitsPerPackage
                ? `(${item.unitsPerPackage}/pack)`
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
                              value={item.realStock ?? ''}
                              placeholder="Stock"
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '') {
                                  // Allow clearing the field - set to undefined to show placeholder
                                  onRealStockChange(item.productId, undefined)
                                } else {
                                  const val = parseFloat(value)
                                  if (!isNaN(val) && val >= 0) {
                                    onRealStockChange(item.productId, val)
                                  }
                                }
                              }}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.currentTarget.value = ''
                                  onRealStockChange(item.productId, undefined)
                                }
                              }}
                              className="w-20 px-2 py-1 border rounded text-center font-mono"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{item.realStock ?? '-'}</span>
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
                                  const val = parseFloat(value)
                                  if (!isNaN(val) && val >= 0) {
                                    onQuantityChange(item.productId, val)
                                  }
                                }
                              }}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.currentTarget.value = ''
                                  onQuantityChange(item.productId, 0)
                                }
                              }}
                              className="w-20 px-2 py-1 border rounded text-center font-mono"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{item.quantity || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="border-l-2 border-muted"></TableCell>
                    </>
                  )}
                  {!showStockInfo && (
                    <TableCell className="text-center font-mono">
                      {editable && onQuantityChange ? (
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            if (!isNaN(val) && val >= 0) {
                              onQuantityChange(item.productId, val)
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
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
                              const val = parseFloat(e.target.value)
                              if (!isNaN(val) && val >= 0) {
                                onQuantityChange(item.productId, val)
                              }
                            }}
                            onFocus={(e) => e.target.select()}
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
