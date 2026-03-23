'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Package } from 'lucide-react'
import { ReceiveOrderForm } from './ReceiveOrderForm'
import type { PurchaseOrder } from '@/types/inventory'

interface ReceiveOrderModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Modal pour réceptionner une commande
 * - Si 1 commande en attente → affiche le formulaire directement
 * - Si plusieurs → affiche la liste des fournisseurs
 */
export function ReceiveOrderModal({ open, onClose }: ReceiveOrderModalProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders when modal opens
  useEffect(() => {
    if (open) {
      fetchSentOrders()
    } else {
      // Reset state when modal closes
      setOrders([])
      setSelectedOrder(null)
      setError(null)
    }
  }, [open])

  const fetchSentOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory/purchase-orders/public/sent')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      const sentOrders = data.data || []
      setOrders(sentOrders)

      // If only 1 order, select it automatically
      if (sentOrders.length === 1) {
        setSelectedOrder(sentOrders[0])
      }
    } catch (err) {
      console.error('Error fetching sent orders:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    onClose()
  }

  const handleBack = () => {
    setSelectedOrder(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedOrder
              ? `Réception - ${selectedOrder.supplierName}`
              : 'Réceptionner une commande'}
          </DialogTitle>
          <DialogDescription>
            {selectedOrder
              ? `Commande ${selectedOrder.orderNumber}`
              : 'Sélectionnez la commande à réceptionner'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={fetchSentOrders}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucune commande en attente de réception
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && !selectedOrder && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {orders.length} commande(s) en attente
            </p>
            {orders.map((order) => (
              <Button
                key={order._id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 border-gray-300 hover:border-green-500 hover:bg-green-50"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold">{order.supplierName}</span>
                    <span className="text-sm text-muted-foreground">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{order.items.length} produit(s)</span>
                    <span>{order.totalTTC.toFixed(2)} € TTC</span>
                    {order.sentAt && (
                      <span>
                        Envoyée le {new Date(order.sentAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {!loading && !error && selectedOrder && (
          <ReceiveOrderForm
            order={selectedOrder}
            onSuccess={handleSuccess}
            onBack={orders.length > 1 ? handleBack : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
