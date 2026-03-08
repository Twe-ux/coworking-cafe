'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderItemsTable } from '@/components/inventory/orders'
import { useOrderActions } from '@/hooks/inventory/useOrderActions'
import type { Supplier, Product, CreatePurchaseOrderItemData, APIResponse } from '@/types/inventory'

interface ProductSuggestion {
  productId: string
  productName: string
  packagingType: string
  currentStock: number
  minStock: number
  suggestedQuantity: number
  unitPriceHT: number
  vatRate: number
}

interface OrderItemDisplay extends CreatePurchaseOrderItemData {
  productName: string
  packagingType: string
  unitPriceHT: number
  vatRate: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { creating, createOrder } = useOrderActions()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [items, setItems] = useState<OrderItemDisplay[]>([])
  const [notes, setNotes] = useState('')

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Fetch products when supplier changes
  useEffect(() => {
    if (selectedSupplierId) {
      fetchProducts(selectedSupplierId)
    }
  }, [selectedSupplierId])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/inventory/suppliers')
      const data = (await res.json()) as APIResponse<Supplier[]>
      if (data.success && data.data) {
        setSuppliers(data.data.filter((s) => s.isActive))
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const fetchProducts = async (supplierId: string) => {
    setLoadingProducts(true)
    try {
      const res = await fetch(
        `/api/inventory/products?supplierId=${supplierId}&active=true`
      )
      const data = (await res.json()) as APIResponse<Product[]>
      if (data.success && data.data) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadSuggestions = async () => {
    if (!selectedSupplierId) return

    setLoadingSuggestions(true)
    try {
      const res = await fetch(
        `/api/inventory/purchase-orders/suggestions?supplierId=${selectedSupplierId}`
      )
      const data = (await res.json()) as APIResponse<{
        supplier: Supplier
        suggestions: ProductSuggestion[]
      }>

      if (data.success && data.data) {
        const newItems: OrderItemDisplay[] = data.data.suggestions.map((s) => ({
          productId: s.productId,
          productName: s.productName,
          quantity: s.suggestedQuantity,
          packagingType: s.packagingType,
          unitPriceHT: s.unitPriceHT,
          vatRate: s.vatRate || 5.5,
        }))
        setItems(newItems)
      }
    } catch (err) {
      console.error('Error loading suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const addProduct = (productId: string) => {
    const product = products.find((p) => p._id === productId)
    if (!product) return

    // Check if already added
    if (items.some((i) => i.productId === productId)) {
      alert('Ce produit est déjà dans la commande')
      return
    }

    const newItem: OrderItemDisplay = {
      productId: product._id,
      productName: product.name,
      quantity: product.maxStock - product.currentStock || 1,
      packagingType: product.packagingType,
      unitPriceHT: product.unitPriceHT,
      vatRate: product.vatRate,
    }

    setItems([...items, newItem])
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    )
  }

  const calculateTotals = () => {
    const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unitPriceHT, 0)
    // Calculate TTC using actual VAT rate of each product
    const totalTTC = items.reduce((sum, item) => {
      const itemTotalHT = item.quantity * item.unitPriceHT
      const itemTotalTTC = itemTotalHT * (1 + item.vatRate / 100)
      return sum + itemTotalTTC
    }, 0)
    return { totalHT, totalTTC }
  }

  const handleCreate = async () => {
    if (!selectedSupplierId) {
      alert('Veuillez sélectionner un fournisseur')
      return
    }

    if (items.length === 0) {
      alert('Veuillez ajouter au moins un produit')
      return
    }

    // Convert to API format (only productId + quantity)
    const orderItems: CreatePurchaseOrderItemData[] = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    const result = await createOrder({
      supplierId: selectedSupplierId,
      items: orderItems,
      notes,
    })

    if (result.success && result.orderId) {
      router.push(`/admin/inventory/orders/${result.orderId}`)
    } else {
      alert(`Erreur: ${result.error || 'Erreur inconnue'}`)
    }
  }

  const { totalHT, totalTTC } = calculateTotals()
  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId)

  if (loadingSuppliers) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/inventory/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Commande Fournisseur</h1>
          <p className="text-muted-foreground mt-1">
            Créer un brouillon de commande
          </p>
        </div>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Fournisseur</CardTitle>
          <CardDescription>Sélectionnez le fournisseur pour cette commande</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="supplier">Fournisseur *</Label>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Choisir un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSupplier && (
            <div className="text-sm space-y-1 p-4 bg-muted rounded">
              <p><strong>Contact:</strong> {selectedSupplier.contact}</p>
              <p><strong>Email:</strong> {selectedSupplier.email}</p>
              <p><strong>Téléphone:</strong> {selectedSupplier.phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Produits</CardTitle>
                <CardDescription>Ajouter des produits à la commande</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={loadSuggestions}
                disabled={loadingSuggestions}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {loadingSuggestions ? 'Chargement...' : 'Suggestions auto'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Product */}
            <div className="flex gap-2">
              <Select onValueChange={(value) => addProduct(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Ajouter un produit..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingProducts ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Chargement...
                    </div>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} ({product.packagingType}) - {product.unitPriceHT.toFixed(2)} €
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" disabled>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items Table */}
            <OrderItemsTable
              items={items}
              editable
              onRemove={removeItem}
              onQuantityChange={updateQuantity}
            />

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="space-y-2 min-w-[200px]">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total HT</span>
                    <span className="font-medium">{totalHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC</span>
                    <span>{totalTTC.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <CardTitle>Notes (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Notes internes sur cette commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedSupplierId && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/inventory/orders')}
          >
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={creating || items.length === 0}>
            {creating ? 'Création...' : 'Créer la commande'}
          </Button>
        </div>
      )}
    </div>
  )
}
