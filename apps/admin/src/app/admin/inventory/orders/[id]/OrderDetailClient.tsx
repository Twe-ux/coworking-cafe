'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  Send,
  Package,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrder } from '@/hooks/inventory/useOrder'
import { useOrderActions } from '@/hooks/inventory/useOrderActions'
import { useInventoryPermissions } from '@/lib/inventory/usePermissions'
import { OrderStatusBadge, OrderSummary, OrderItemsTable } from '@/components/inventory/orders'

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { order, loading, refetch } = useOrder(id)
  const {
    validating,
    sending,
    receiving,
    validateOrder,
    sendOrder,
    receiveOrder,
    deleteOrder,
  } = useOrderActions()
  const { canManageSuppliers } = useInventoryPermissions()

  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})

  const handleValidate = async () => {
    const success = await validateOrder(id)
    if (success) {
      setValidateDialogOpen(false)
      await refetch()
    } else {
      alert('Erreur lors de la validation')
    }
  }

  const handleSend = async () => {
    const success = await sendOrder(id)
    if (success) {
      setSendDialogOpen(false)
      await refetch()
      alert('Email envoyé au fournisseur !')
    } else {
      alert('Erreur lors de l\'envoi de l\'email')
    }
  }

  const handleReceive = async () => {
    if (!order) return

    const items = order.items.map((item) => ({
      productId: item.productId,
      receivedQty: receivedQuantities[item.productId] ?? item.quantity,
    }))

    const success = await receiveOrder(id, { items })
    if (success) {
      setReceiveDialogOpen(false)
      await refetch()
      alert('Commande réceptionnée avec succès !')
    } else {
      alert('Erreur lors de la réception')
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

  const handleDelete = async () => {
    const success = await deleteOrder(id)
    if (success) {
      router.push('/admin/inventory/orders')
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-destructive">Commande introuvable</p>
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/inventory/orders')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    )
  }

  const isAdmin = canManageSuppliers
  const canEdit = order.status === 'draft'
  const canValidate = order.status === 'draft' && isAdmin
  const canSend = order.status === 'validated' && isAdmin
  const canReceive = order.status === 'sent'
  const canDelete = order.status === 'draft'

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/inventory/orders')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1">{order.supplierName}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/inventory/orders/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
          {canValidate && (
            <Button onClick={() => setValidateDialogOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider
            </Button>
          )}
          {canSend && (
            <Button onClick={() => setSendDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer au fournisseur
            </Button>
          )}
          {canReceive && (
            <Button onClick={openReceiveDialog}>
              <Package className="mr-2 h-4 w-4" />
              Réceptionner
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Produits commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsTable items={order.items} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <OrderSummary order={order} />

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Créée le</span>
                <p className="font-medium">{order.createdAt}</p>
              </div>
              {order.validatedAt && (
                <div>
                  <span className="text-muted-foreground">Validée le</span>
                  <p className="font-medium">{order.validatedAt}</p>
                </div>
              )}
              {order.sentAt && (
                <div>
                  <span className="text-muted-foreground">Envoyée le</span>
                  <p className="font-medium">{order.sentAt}</p>
                </div>
              )}
              {order.receivedAt && (
                <div>
                  <span className="text-muted-foreground">Reçue le</span>
                  <p className="font-medium">{order.receivedAt}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validate Dialog */}
      <AlertDialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmer les produits et quantités avant envoi au fournisseur ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleValidate} disabled={validating}>
              {validating ? 'Validation...' : 'Valider'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Email Dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer au fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Un email avec le détail de la commande sera envoyé à {order.supplierName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={sending}>
              {sending ? 'Envoi...' : 'Envoyer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réceptionner la commande</DialogTitle>
            <DialogDescription>
              Saisissez les quantités reçues pour chaque produit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 border rounded"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Commandé : {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="w-32">
                  <Label htmlFor={`qty-${item.productId}`}>Qté reçue</Label>
                  <Input
                    id={`qty-${item.productId}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={receivedQuantities[item.productId] ?? item.quantity}
                    onChange={(e) =>
                      setReceivedQuantities({
                        ...receivedQuantities,
                        [item.productId]: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiveDialogOpen(false)}
              disabled={receiving}
            >
              Annuler
            </Button>
            <Button onClick={handleReceive} disabled={receiving}>
              {receiving ? 'Réception en cours...' : 'Confirmer la réception'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer le brouillon {order.orderNumber} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
