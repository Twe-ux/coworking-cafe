'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, ShoppingCart, CheckCircle } from 'lucide-react'

interface StockCount {
  productId: string
  productName: string
  countedStock: number
  orderSuggestion: number
  packageUnit: string
}

interface DLCStockCountNotificationProps {
  taskId: string
  stockCounts: StockCount[]
  submittedBy?: string
  submittedAt?: string
  onMarkRead?: () => void
}

export function DLCStockCountNotification({
  taskId,
  stockCounts,
  submittedBy,
  submittedAt,
  onMarkRead,
}: DLCStockCountNotificationProps) {
  const router = useRouter()

  const hasOrderSuggestions = stockCounts.some((sc) => sc.orderSuggestion > 0)

  const handleCreateOrder = () => {
    // Redirect to orders page with pre-filled data
    const productsToOrder = stockCounts
      .filter((sc) => sc.orderSuggestion > 0)
      .map((sc) => ({
        productId: sc.productId,
        quantity: sc.orderSuggestion,
      }))

    // Store in sessionStorage for pre-filling the order form
    sessionStorage.setItem(
      'orderDraft',
      JSON.stringify({
        source: 'dlc_stock_count',
        taskId,
        products: productsToOrder,
      })
    )

    router.push('/admin/inventory/orders/new')
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bell className="h-5 w-5" />
          Stock DLC Courte Compté
        </CardTitle>
        {submittedBy && (
          <p className="text-sm text-muted-foreground">
            Par {submittedBy} • {formatDate(submittedAt)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Résultats du comptage :</p>
          {stockCounts.map((sc) => (
            <div
              key={sc.productId}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <p className="font-medium">{sc.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Stock compté : {sc.countedStock} {sc.packageUnit}
                </p>
              </div>
              {sc.orderSuggestion > 0 && (
                <Badge
                  variant="outline"
                  className="border-orange-500 bg-orange-50 text-orange-700"
                >
                  Commander {sc.orderSuggestion.toFixed(1)} {sc.packageUnit}
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {hasOrderSuggestions ? (
            <Button
              onClick={handleCreateOrder}
              className="flex-1 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
              variant="outline"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Créer Commande Automatiquement
            </Button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Tous les stocks sont suffisants
            </div>
          )}

          {onMarkRead && (
            <Button
              onClick={onMarkRead}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
            >
              Marquer comme lu
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Le bouton "Créer Commande" pré-remplit automatiquement le formulaire
          avec les quantités suggérées
        </p>
      </CardContent>
    </Card>
  )
}
