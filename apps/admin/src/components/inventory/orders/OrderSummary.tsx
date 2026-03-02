import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder } from '@/types/inventory'

interface OrderSummaryProps {
  order: PurchaseOrder
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nombre de produits</span>
          <span className="font-medium">{order.items.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total HT</span>
          <span className="font-medium">{order.totalHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total TTC</span>
          <span>{order.totalTTC.toFixed(2)} €</span>
        </div>
        {order.notes && (
          <div className="border-t pt-2 mt-2">
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{order.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
