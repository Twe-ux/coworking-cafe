'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useProducts } from '@/hooks/inventory/useProducts'
import type {
  Product,
  ProductFormData,
  APIResponse,
  CreateDirectPurchaseData,
  CreateDirectPurchaseItemData,
} from '@/types/inventory'

interface FormItem {
  productId: string
  productName: string
  quantity: number
  unitPriceHT: number
  vatRate: number
  packagingType: string
  unitsPerPackage: number
}

export function useDirectPurchaseForm(supplierId: string, supplierName: string) {
  const router = useRouter()
  const { toast } = useToast()
  const { createProduct } = useProducts({})

  const [date, setDate] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<FormItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)

  // Set default date to today
  useEffect(() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    setDate(`${y}-${m}-${d}`)
  }, [])

  // Fetch products for selected supplier
  const fetchProducts = useCallback(async () => {
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
  }, [supplierId])

  useEffect(() => {
    if (supplierId) {
      fetchProducts()
    }
  }, [supplierId, fetchProducts])

  const handleCreateProduct = useCallback(async (
    data: ProductFormData
  ): Promise<boolean> => {
    const success = await createProduct(data)
    if (success) {
      await fetchProducts()
    }
    return success
  }, [createProduct, fetchProducts])

  const addItem = useCallback((productId: string) => {
    if (!productId) return
    if (items.some((i) => i.productId === productId)) {
      toast({
        title: 'Produit deja ajoute',
        description: 'Ce produit est deja dans la liste',
        variant: 'destructive',
      })
      return
    }

    const product = products.find((p) => p._id === productId)
    if (!product) return

    setItems((prev) => [
      ...prev,
      {
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unitPriceHT: product.unitPriceHT,
        vatRate: product.vatRate,
        packagingType: product.packagingType,
        unitsPerPackage: product.unitsPerPackage || 1,
      },
    ])
  }, [items, products, toast])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateItem = useCallback((
    productId: string,
    field: 'quantity' | 'unitPriceHT',
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, [field]: value } : i))
    )
  }, [])

  const getItemTotalHT = useCallback((item: FormItem) => {
    const pricePerItem =
      item.packagingType === 'pack' && item.unitsPerPackage
        ? item.unitPriceHT * item.unitsPerPackage
        : item.unitPriceHT
    return item.quantity * pricePerItem
  }, [])

  const totalHT = useMemo(
    () => items.reduce((sum, i) => sum + getItemTotalHT(i), 0),
    [items, getItemTotalHT]
  )

  const totalTTC = useMemo(
    () => items.reduce((sum, i) => {
      const lineHT = getItemTotalHT(i)
      return sum + lineHT * (1 + i.vatRate / 100)
    }, 0),
    [items, getItemTotalHT]
  )

  const canSubmit = date !== '' && items.length > 0 && !submitting

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    setSubmitting(true)
    try {
      const apiItems: CreateDirectPurchaseItemData[] = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPriceHT: i.unitPriceHT,
      }))

      const body: CreateDirectPurchaseData = {
        supplier: supplierName,
        items: apiItems,
        date,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      }

      const res = await fetch('/api/inventory/direct-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as APIResponse<unknown>

      if (data.success) {
        toast({
          title: 'Achat enregistre',
          description: `${items.length} produit(s) - ${totalTTC.toFixed(2)} EUR TTC`,
        })
        router.push('/admin/inventory/direct-purchases')
      } else {
        toast({
          title: 'Erreur',
          description: data.error || "Impossible d'enregistrer l'achat",
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, items, supplierName, date, invoiceNumber, notes, totalTTC, toast, router])

  // Available products (not yet added)
  const availableProducts = useMemo(
    () => products
      .filter((p) => !items.some((i) => i.productId === p._id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [products, items]
  )

  const cancel = useCallback(() => {
    router.push('/admin/inventory/direct-purchases')
  }, [router])

  return {
    date, setDate,
    invoiceNumber, setInvoiceNumber,
    notes, setNotes,
    items,
    addItem, removeItem, updateItem,
    getItemTotalHT,
    totalHT, totalTTC,
    canSubmit,
    handleSubmit, submitting,
    cancel,
    products: availableProducts,
    loadingProducts,
    productDialogOpen, setProductDialogOpen,
    handleCreateProduct,
  }
}
