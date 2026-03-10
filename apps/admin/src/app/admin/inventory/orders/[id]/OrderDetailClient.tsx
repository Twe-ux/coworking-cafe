'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Edit, Trash2, CheckCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { OrderItemsTable, OrderSummarySimple, OrderStatusBadge } from '@/components/inventory/orders'
import { useOrder } from '@/hooks/inventory/useOrder'
import { useOrderActions } from '@/hooks/inventory/useOrderActions'

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { order, loading, refetch } = useOrder(id)
  const {
    validating,
    receiving,
    deleteOrder,
  } = useOrderActions()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})
  const [validating2, setValidating2] = useState(false)

  const handleDelete = async () => {
    const success = await deleteOrder(id)
    if (success) {
      router.push('/admin/inventory/orders')
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  const handleValidateAndSend = async () => {
    setValidating2(true)
    try {
      // Step 1: Validate
      const validateRes = await fetch(`/api/inventory/purchase-orders/${id}/validate`, {
        method: 'POST',
      })

      if (!validateRes.ok) {
        throw new Error('Erreur lors de la validation')
      }

      // Step 2: Send email
      const sendRes = await fetch(`/api/inventory/purchase-orders/${id}/send`, {
        method: 'POST',
      })

      if (!sendRes.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email')
      }

      setValidateDialogOpen(false)
      await refetch()
      alert('Commande validée et envoyée au fournisseur !')
    } catch (error) {
      console.error('Error validating and sending order:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la validation')
    } finally {
      setValidating2(false)
    }
  }

  const openReceiveDialog = () => {
    if (!order) return
    const quantities: Record<string, number> = {}
    order.items.forEach((item) => {
      quantities[item.productId] = item.quantity
    })
    setReceivedQuantities(quantities)
    setReceiveDialogOpen(true)
  }

  const handleReceive = async () => {
    if (!order) return

    const items = order.items.map((item) => ({
      productId: item.productId,
      receivedQty: receivedQuantities[item.productId] ?? item.quantity,
    }))

    const success = await fetch(`/api/inventory/purchase-orders/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })

    if (success.ok) {
      setReceiveDialogOpen(false)
      await refetch()
      alert('Commande réceptionnée avec succès !')
    } else {
      alert('Erreur lors de la réception')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Commande introuvable</p>
      </div>
    )
  }

  const isDraft = order.status === 'draft'
  const isSent = order.status === 'sent'
  const isReceived = order.status === 'received'

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/inventory/orders')}
            className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Détail Commande</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push('/admin/inventory/orders')}
        >
          <Package className="mr-2 h-4 w-4" />
          Commandes
        </Button>
      </div>

      {/* Supplier Info */}
      <Card className="flex items-center">
        <CardHeader>
          <CardTitle>Fournisseur:</CardTitle>
        </CardHeader>
        <CardContent className="flex p-6">
          <div className="text-2xl font-medium">{order.supplierName}</div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderItemsTable items={order.items} editable={false} />
        </CardContent>
      </Card>

      {/* Notes & Summary - Side by side */}
      <div className={`grid grid-cols-1 gap-6 ${order.notes ? 'lg:grid-cols-3' : ''}`}>
        {/* Notes - 2/3 (only if exists) */}
        {order.notes && (
          <Card className="lg:col-span-2 h-full">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary - 1/3 (full width if no notes) */}
        <div className={`h-full ${order.notes ? 'lg:col-span-1' : ''}`}>
          <OrderSummarySimple
            totalHT={order.totalHT}
            totalTTC={order.totalTTC}
            itemCount={order.items.length}
            createdAt={order.createdAt}
            sentAt={order.sentAt}
            receivedAt={order.receivedAt}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {isDraft && (
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/inventory/orders/${id}/edit`)}
              className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => setValidateDialogOpen(true)}
              disabled={validating2}
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {validating2 ? 'Validation...' : 'Valider & Envoyer'}
            </Button>
          </>
        )}

        {isSent && (
          <Button
            variant="outline"
            onClick={openReceiveDialog}
            disabled={receiving}
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            <Truck className="mr-2 h-4 w-4" />
            {receiving ? 'Réception...' : 'Réceptionner'}
          </Button>
        )}

        {isReceived && (
          <div className="text-sm text-muted-foreground">
            Commande réceptionnée
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement cette commande. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer la commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validate Dialog */}
      <AlertDialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider et envoyer la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande sera validée et un email sera automatiquement envoyé au fournisseur ({order.supplierName}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={validating2}>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleValidateAndSend} disabled={validating2} className="bg-green-500 hover:bg-green-600">
              {validating2 ? 'Envoi en cours...' : 'Valider & Envoyer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Réceptionner la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-4 border-b pb-4">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Commandé: {item.quantity} {item.packagingType === 'pack' ? 'pack(s)' : 'unité(s)'}
                  </p>
                </div>
                <div className="w-32">
                  <Label htmlFor={`received-${item.productId}`}>Reçu</Label>
                  <Input
                    id={`received-${item.productId}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={receivedQuantities[item.productId] ?? item.quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && val >= 0) {
                        setReceivedQuantities({
                          ...receivedQuantities,
                          [item.productId]: val,
                        })
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="text-center font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialogOpen(false)} disabled={receiving}>
              Annuler
            </Button>
            <Button onClick={handleReceive} disabled={receiving}>
              {receiving ? 'Réception...' : 'Confirmer la réception'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
