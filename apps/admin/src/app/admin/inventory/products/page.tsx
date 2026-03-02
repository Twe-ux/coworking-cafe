'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProducts } from '@/hooks/inventory/useProducts'
import { ProductDialog } from '@/components/inventory/products/ProductDialog'
import { ProductFilters } from '@/components/inventory/products/ProductFilters'
import { ProductsTable } from '@/components/inventory/products/ProductsTable'
import type { Product, ProductFormData } from '@/types/inventory'

export default function ProductsPage() {
  const [filters, setFilters] = useState<{
    search?: string
    category?: string
    supplierId?: string
    lowStock?: boolean
    active?: boolean
  }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

  const {
    products,
    loading,
    error,
    lowStockCount,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(filters)

  const handleCreateClick = () => {
    setEditingProduct(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDialogSubmit = async (
    data: ProductFormData
  ): Promise<boolean> => {
    if (dialogMode === 'create') {
      return await createProduct(data)
    } else if (editingProduct) {
      return await updateProduct(editingProduct._id, data)
    }
    return false
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des produits de stock
          </p>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="mt-2 gap-1">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} produit{lowStockCount > 1 ? 's' : ''} en stock
              faible
            </Badge>
          )}
        </div>
        <Button onClick={handleCreateClick} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Produit
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
          <p className="font-medium">Erreur</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Filters */}
      <ProductFilters onFilterChange={setFilters} />

      {/* Table */}
      <ProductsTable
        products={products}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={deleteProduct}
      />

      {/* Dialog */}
      <ProductDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        product={editingProduct}
        mode={dialogMode}
      />
    </div>
  )
}
