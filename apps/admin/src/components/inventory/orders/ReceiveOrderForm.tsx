'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import type { PurchaseOrder } from '@/types/inventory'

interface ReceiveOrderFormProps {
  order: PurchaseOrder
  onSuccess: () => void
  onBack?: () => void
}

interface ReceiveItem {
  productId: string
  productName: string
  orderedQty: number
  receivedQty: number
  packagingType: string
  unitsPerPackage?: number
}

/**
 * Formulaire de réception d'une commande
 * Permet de saisir les quantités reçues pour chaque produit
 */
export function ReceiveOrderForm({
  order,
  onSuccess,
  onBack,
}: ReceiveOrderFormProps) {
  const [items, setItems] = useState<ReceiveItem[]>(
    order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      orderedQty: item.quantity,
      receivedQty: item.quantity, // Default to ordered quantity
      packagingType: item.packagingType,
      unitsPerPackage: item.unitsPerPackage,
    }))
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Local state for input values (string) - one per product
  const [localValues, setLocalValues] = useState<Record<string, string>>({})
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  const handleQuantityChange = (index: number, value: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, receivedQty: value } : item))
    )
  }

  const handleSubmit = async () => {
    // Validate
    const hasReceivedItems = items.some((item) => item.receivedQty > 0)
    if (!hasReceivedItems) {
      toast.error('Veuillez saisir au moins une quantité reçue')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/inventory/purchase-orders/${order._id}/public-receive`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items
              .filter((item) => item.receivedQty > 0)
              .map((item) => ({
                productId: item.productId,
                receivedQty: item.receivedQty,
              })),
            notes: notes.trim() || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la réception')
      }

      toast.success('Commande réceptionnée avec succès')
      onSuccess()
    } catch (error) {
      console.error('Error receiving order:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la réception'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Items list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Produits commandés</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} produit(s)
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const unitDisplay =
              item.packagingType === 'pack'
                ? 'pack'
                : item.packagingType === 'unit'
                ? 'unité(s)'
                : item.packagingType

            const packInfo =
              item.packagingType === 'pack' && item.unitsPerPackage
                ? ` (${item.unitsPerPackage}/pack)`
                : ''

            return (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <Package className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Commandé : {item.orderedQty} {unitDisplay}
                    {packInfo}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Label className="text-sm shrink-0">
                    Reçu :
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={
                      focusedInput === item.productId
                        ? (localValues[item.productId] ?? item.receivedQty.toString())
                        : (item.receivedQty === 0 ? '' : item.receivedQty.toString())
                    }
                    onChange={(e) => {
                      // Store string value locally while typing
                      setLocalValues(prev => ({ ...prev, [item.productId]: e.target.value }))
                    }}
                    onFocus={(e) => {
                      setFocusedInput(item.productId)
                      setLocalValues(prev => ({ ...prev, [item.productId]: item.receivedQty.toString() }))
                      // Safari fix: select all on focus
                      setTimeout(() => e.target.select(), 0)
                    }}
                    onBlur={() => {
                      setFocusedInput(null)
                      // Normalize comma to dot and convert to number
                      const strValue = localValues[item.productId] || '0'
                      const normalized = strValue.replace(/,/g, '.')
                      const numValue = parseFloat(normalized) || 0
                      handleQuantityChange(index, Math.max(0, numValue))
                      // Clear local value
                      setLocalValues(prev => {
                        const copy = { ...prev }
                        delete copy[item.productId]
                        return copy
                      })
                    }}
                    className="w-24 text-center"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">
                    {unitDisplay}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Produit endommagé, quantité incorrecte..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="ml-auto border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          variant="outline"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Valider la réception
        </Button>
      </div>
    </div>
  )
}
