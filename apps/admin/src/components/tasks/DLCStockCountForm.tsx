'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, PackageCheck } from 'lucide-react'
import type { Product } from '@/types/inventory'
import { triggerSidebarRefresh } from '@/lib/events/sidebar-refresh'

interface DLCStockCountFormProps {
  taskId: string
  productIds: string[]
  onComplete: () => void
}

interface StockEntry {
  productId: string
  productName: string
  currentStock: number
  countedStock: number
  minStock: number
  maxStock: number
  packageUnit?: string
  packagingType: string
  unitsPerPackage: number
}

export function DLCStockCountForm({
  taskId,
  productIds,
  onComplete,
}: DLCStockCountFormProps) {
  const [products, setProducts] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [productIds])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/tasks/products?ids=${productIds.join(',')}`
      )

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        setError(`Erreur ${response.status}: ${response.statusText}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (data.success && data.data) {
        const entries: StockEntry[] = data.data.map((p: Product) => ({
          productId: p._id,
          productName: p.name,
          currentStock: p.currentStock,
          countedStock: 0,
          minStock: p.minStock,
          maxStock: p.maxStock,
          packageUnit: p.packageUnit,
          packagingType: p.packagingType || 'unit',
          unitsPerPackage: p.unitsPerPackage || 1,
        }))
        setProducts(entries)
      } else {
        console.error('Invalid data format:', data)
        setError(data.error || 'Erreur lors du chargement des produits')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(`Erreur réseau: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = value === '' ? 0 : parseFloat(value)
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, countedStock: quantity } : p
      )
    )
  }

  const calculateOrderSuggestion = (entry: StockEntry) => {
    // If stock is above minimum, no need to order
    if (entry.countedStock >= entry.minStock) {
      return 0
    }

    // Calculate need in units
    const need = entry.maxStock - entry.countedStock

    // If ordering in packs, round up to next pack
    if (entry.packagingType === 'pack' && entry.unitsPerPackage > 1) {
      const packs = Math.ceil(need / entry.unitsPerPackage)
      return packs
    }

    // Otherwise return need in units
    return need
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Submit stock counts
      const response = await fetch('/api/tasks/dlc-stock-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          products: products.map((p) => ({
            productId: p.productId,
            countedStock: p.countedStock,
            orderSuggestion: calculateOrderSuggestion(p),
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Trigger sidebar refresh to update badge immediately
        triggerSidebarRefresh()
        onComplete()
      } else {
        setError(data.error || 'Erreur lors de la soumission')
      }
    } catch (err) {
      console.error('Error submitting stock counts:', err)
      setError('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const allCounted = products.every((p) => p.countedStock > 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5" />
          Compter Stock DLC Courte
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Comptez le stock actuel de chaque produit et soumettez pour générer
          les suggestions de commande.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {products.map((entry) => {
            const suggestion = calculateOrderSuggestion(entry)
            return (
              <div
                key={entry.productId}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{entry.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock actuel système : {entry.currentStock}{' '}
                    {entry.packageUnit || 'unités'}
                  </p>
                  {entry.countedStock > 0 && suggestion > 0 && (
                    <Badge
                      variant="outline"
                      className="mt-2 border-orange-500 bg-orange-50 text-orange-700"
                    >
                      Suggestion : Commander {suggestion.toFixed(0)}{' '}
                      {entry.packagingType === 'pack' ? 'pack(s)' : entry.packageUnit || 'unités'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={entry.countedStock || ''}
                    onChange={(e) =>
                      handleQuantityChange(entry.productId, e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    placeholder="Quantité comptée"
                    className="w-32 text-right"
                  />
                  <span className="text-sm text-muted-foreground min-w-[60px]">
                    {entry.packageUnit || 'unités'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allCounted || submitting}
          className="w-full border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          variant="outline"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Soumettre et Notifier Admin'
          )}
        </Button>

        {!allCounted && (
          <p className="text-sm text-muted-foreground text-center">
            Veuillez compter tous les produits avant de soumettre
          </p>
        )}
      </CardContent>
    </Card>
  )
}
