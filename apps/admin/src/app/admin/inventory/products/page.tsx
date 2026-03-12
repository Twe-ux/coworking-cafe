'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Plus, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProducts } from '@/hooks/inventory/useProducts'
import { ProductDialog } from '@/components/inventory/products/ProductDialog'
import { ProductStatsCards } from '@/components/inventory/products/ProductStatsCards'
import { ProductSearchBar } from '@/components/inventory/products/ProductSearchBar'
import { ProductsBySupplierList } from '@/components/inventory/products/ProductsBySupplierList'
import { LossDeclarationModal } from '@/components/inventory/products/LossDeclarationModal'
import { useSupplierOrder } from '@/hooks/inventory/useSupplierOrder'
import { markBadgeSeen } from '@/lib/utils/badge-seen'
import { triggerSidebarRefresh } from '@/lib/events/sidebar-refresh'
import type { Product, ProductFormData, ProductCategory } from '@/types/inventory'

export default function ProductsPage() {
  // Mark products as seen when page loads → clears sidebar badge
  useEffect(() => {
    markBadgeSeen('products')
    triggerSidebarRefresh()
  }, [])
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<string>('active')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null)
  const [lossModalOpen, setLossModalOpen] = useState(false)
  const [lossProduct, setLossProduct] = useState<Product | null>(null)
  const { getOrder, reorder } = useSupplierOrder()

  // Build API filters (category handled client-side via StatsCards)
  const apiFilters = useMemo(() => {
    const f: { search?: string; active?: boolean; lowStock?: boolean } = {}
    if (search) f.search = search
    if (activeStatus !== 'all') f.active = activeStatus === 'active'
    if (lowStockOnly) f.lowStock = true
    return f
  }, [search, activeStatus, lowStockOnly])

  const {
    products, loading, error, lowStockCount, refetch,
    createProduct, updateProduct, deleteProduct, reactivateProduct,
  } = useProducts(apiFilters)

  // Client-side: filter by category, group by supplier
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  const supplierGroups = useMemo(() => {
    const groups = new Map<string, { supplierName: string; supplierId: string; products: Product[] }>()
    for (const p of filteredProducts) {
      const key = p.supplierId
      if (!groups.has(key)) groups.set(key, { supplierName: p.supplierName || 'Sans fournisseur', supplierId: key, products: [] })
      groups.get(key)!.products.push(p)
    }
    return Array.from(groups.values())
      .sort((a, b) => {
        const orderDiff = getOrder(a.supplierId) - getOrder(b.supplierId)
        return orderDiff !== 0 ? orderDiff : a.supplierName.localeCompare(b.supplierName)
      })
      .map((g) => ({ ...g, products: [...g.products].sort((a, b) => a.name.localeCompare(b.name)) }))
  }, [filteredProducts, getOrder])

  const handleReorder = useCallback((reorderedGroups: Array<{ supplierId: string }>) => {
    reorder(reorderedGroups.map((g) => g.supplierId))
  }, [reorder])

  const handleCreate = () => { setEditingProduct(null); setDialogMode('create'); setDialogOpen(true) }
  const handleEdit = (p: Product) => { setEditingProduct(p); setDialogMode('edit'); setDialogOpen(true) }
  const handleDialogClose = () => { setDialogOpen(false); setEditingProduct(null) }
  const handleDialogSubmit = async (data: ProductFormData): Promise<boolean> => {
    if (dialogMode === 'create') return createProduct(data)
    if (editingProduct) return updateProduct(editingProduct._id, data)
    return false
  }
  const handleDeclareLoss = (p: Product) => { setLossProduct(p); setLossModalOpen(true) }
  const handleDeactivateClick = (p: Product) => { setProductToDeactivate(p); setDeactivateDialogOpen(true) }
  const handleConfirmDeactivate = async () => {
    if (!productToDeactivate) return
    await deleteProduct(productToDeactivate._id)
    setDeactivateDialogOpen(false)
    setProductToDeactivate(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground mt-1">Gestion des produits de stock</p>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="mt-2 gap-1">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} produit{lowStockCount > 1 ? 's' : ''} en stock faible
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory/entries">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              Inventaires
            </Button>
          </Link>
          <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50" onClick={handleCreate} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
          <p className="font-medium">Erreur</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <ProductStatsCards products={products} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <ProductSearchBar
        search={search} onSearchChange={setSearch}
        activeStatus={activeStatus} onActiveStatusChange={setActiveStatus}
        lowStockOnly={lowStockOnly} onLowStockChange={setLowStockOnly}
      />

      <ProductsBySupplierList
        groups={supplierGroups} loading={loading} onReorder={handleReorder}
        onEdit={handleEdit} onDeactivate={handleDeactivateClick} onReactivate={reactivateProduct}
        onDeclareLoss={handleDeclareLoss}
      />

      <ProductDialog open={dialogOpen} onClose={handleDialogClose} onSubmit={handleDialogSubmit} product={editingProduct} mode={dialogMode} />

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver le produit</AlertDialogTitle>
            <AlertDialogDescription>
              Désactiver <strong>{productToDeactivate?.name}</strong> ? Le produit pourra être réactivé plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate}>Désactiver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lossProduct && (
        <LossDeclarationModal
          product={lossProduct}
          open={lossModalOpen}
          onClose={() => { setLossModalOpen(false); setLossProduct(null) }}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
