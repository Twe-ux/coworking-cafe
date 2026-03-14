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
  const [noEmailDialogOpen, setNoEmailDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})
  const [receivedPrices, setReceivedPrices] = useState<Record<string, number>>({})
  const [validating2, setValidating2] = useState(false)
  const [temporaryEmail, setTemporaryEmail] = useState('')

  const handleDelete = async () => {
    const success = await deleteOrder(id)
    if (success) {
      router.push('/admin/inventory/orders')
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  const handleValidateClick = async () => {
    if (!order) return

    // Fetch current supplier info to check if email exists
    try {
      const response = await fetch(`/api/inventory/suppliers/${order.supplierId}`)
      const result = await response.json()

      if (result.success && result.data) {
        const currentSupplierEmail = result.data.email

        // Check if supplier has email (use current email, not stored one)
        if (!currentSupplierEmail || currentSupplierEmail.trim() === '') {
          setNoEmailDialogOpen(true)
        } else {
          setValidateDialogOpen(true)
        }
      } else {
        // Fallback to stored email if supplier fetch fails
        if (!order.supplierEmail) {
          setNoEmailDialogOpen(true)
        } else {
          setValidateDialogOpen(true)
        }
      }
    } catch (error) {
      console.error('Error fetching supplier:', error)
      // Fallback to stored email if fetch fails
      if (!order.supplierEmail) {
        setNoEmailDialogOpen(true)
      } else {
        setValidateDialogOpen(true)
      }
    }
  }

  const handleValidateAndSend = async (emailToUse?: string) => {
    setValidating2(true)
    try {
      // Step 1: Validate
      const validateRes = await fetch(`/api/inventory/purchase-orders/${id}/validate`, {
        method: 'POST',
      })

      if (!validateRes.ok) {
        throw new Error('Erreur lors de la validation')
      }

      // Step 2: Send email (with optional temporary email)
      const sendRes = await fetch(`/api/inventory/purchase-orders/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: emailToUse ? JSON.stringify({ temporaryEmail: emailToUse }) : undefined,
      })

      if (!sendRes.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email')
      }

      setValidateDialogOpen(false)
      setNoEmailDialogOpen(false)
      setTemporaryEmail('')
      await refetch()
      alert('Commande validée et envoyée au fournisseur !')
    } catch (error) {
      console.error('Error validating and sending order:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la validation')
    } finally {
      setValidating2(false)
    }
  }

  const handleValidateWithoutSending = async () => {
    setValidating2(true)
    try {
      // Only validate, don't send email
      const validateRes = await fetch(`/api/inventory/purchase-orders/${id}/validate`, {
        method: 'POST',
      })

      if (!validateRes.ok) {
        throw new Error('Erreur lors de la validation')
      }

      setNoEmailDialogOpen(false)
      await refetch()
      alert('Commande validée (non envoyée par email)')
    } catch (error) {
      console.error('Error validating order:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la validation')
    } finally {
      setValidating2(false)
    }
  }

  const openReceiveDialog = () => {
    if (!order) return
    const quantities: Record<string, number> = {}
    const prices: Record<string, number> = {}
    order.items.forEach((item) => {
      quantities[item.productId] = item.quantity
      // Calculate displayed price: if pack, multiply by unitsPerPackage
      const displayPrice = item.packagingType === 'pack' && item.unitsPerPackage
        ? item.unitPriceHT * item.unitsPerPackage
        : item.unitPriceHT
      prices[item.productId] = displayPrice
    })
    setReceivedQuantities(quantities)
    setReceivedPrices(prices)
    setReceiveDialogOpen(true)
  }

  const handleReceive = async () => {
    if (!order) return

    const items = order.items.map((item) => {
      const displayedPrice = receivedPrices[item.productId] ?? (
        item.packagingType === 'pack' && item.unitsPerPackage
          ? item.unitPriceHT * item.unitsPerPackage
          : item.unitPriceHT
      )

      // Convert back to unit price for API: if pack, divide by unitsPerPackage
      const unitPrice = item.packagingType === 'pack' && item.unitsPerPackage
        ? displayedPrice / item.unitsPerPackage
        : displayedPrice

      return {
        productId: item.productId,
        receivedQty: receivedQuantities[item.productId] ?? item.quantity,
        receivedPrice: unitPrice,
      }
    })

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
              onClick={handleValidateClick}
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

      {/* Validate Dialog (with email) */}
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
            <AlertDialogAction onClick={() => handleValidateAndSend()} disabled={validating2} className="bg-green-500 hover:bg-green-600">
              {validating2 ? 'Envoi en cours...' : 'Valider & Envoyer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Email Dialog */}
      <Dialog open={noEmailDialogOpen} onOpenChange={setNoEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aucun email référencé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le fournisseur <strong>{order.supplierName}</strong> n'a pas d'email enregistré.
            </p>
            <div className="space-y-2">
              <Label htmlFor="temporary-email">Email temporaire (optionnel)</Label>
              <Input
                id="temporary-email"
                type="email"
                placeholder="contact@fournisseur.com"
                value={temporaryEmail}
                onChange={(e) => setTemporaryEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Vous pouvez saisir un email pour envoyer cette commande uniquement
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (temporaryEmail && temporaryEmail.includes('@')) {
                  handleValidateAndSend(temporaryEmail)
                } else {
                  alert('Veuillez saisir un email valide')
                }
              }}
              disabled={validating2 || !temporaryEmail || !temporaryEmail.includes('@')}
              className="w-full border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {validating2 ? 'Envoi...' : 'Valider & Envoyer avec cet email'}
            </Button>
            <Button
              variant="outline"
              onClick={handleValidateWithoutSending}
              disabled={validating2}
              className="w-full border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
            >
              {validating2 ? 'Validation...' : 'Valider sans envoi (transmission manuelle)'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNoEmailDialogOpen(false)
                setTemporaryEmail('')
              }}
              disabled={validating2}
              className="w-full"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Réceptionner la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {order.items.map((item) => {
              const isPack = item.packagingType === 'pack'

              // Calculate displayed prices (pack price if applicable)
              const originalDisplayPrice = isPack && item.unitsPerPackage
                ? item.unitPriceHT * item.unitsPerPackage
                : item.unitPriceHT

              const currentPrice = receivedPrices[item.productId] ?? originalDisplayPrice
              const priceDiff = ((currentPrice - originalDisplayPrice) / originalDisplayPrice) * 100
              const hasPriceChange = Math.abs(priceDiff) > 0.01

              const priceLabel = isPack ? 'Prix par pack HT (€)' : 'Prix unitaire HT (€)'
              const packInfo = isPack && item.unitsPerPackage
                ? ` (${item.unitsPerPackage} unités/pack)`
                : ''

              return (
                <div key={item.productId} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Commandé: {item.quantity} {isPack ? 'pack(s)' : 'unité(s)'}{packInfo}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`received-qty-${item.productId}`}>
                        Quantité reçue {isPack ? '(packs)' : '(unités)'}
                      </Label>
                      <Input
                        id={`received-qty-${item.productId}`}
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
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`received-price-${item.productId}`}>
                        {priceLabel}
                        {hasPriceChange && (
                          <span className={`ml-2 text-xs ${priceDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                          </span>
                        )}
                      </Label>
                      <Input
                        id={`received-price-${item.productId}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val) && val >= 0) {
                            setReceivedPrices({
                              ...receivedPrices,
                              [item.productId]: val,
                            })
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className={`font-mono ${hasPriceChange ? 'border-orange-400 bg-orange-50' : ''}`}
                      />
                      {hasPriceChange && (
                        <p className="text-xs text-orange-600 mt-1">
                          {isPack ? 'Prix pack' : 'Prix'} commandé: {originalDisplayPrice.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Info:</strong> Si le prix est modifié, il sera mis à jour dans la fiche produit pour les futures commandes.
            </p>
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
