'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/hooks/inventory/useSuppliers'
import { SupplierDialog } from '@/components/inventory/suppliers/SupplierDialog'
import { SupplierFilters } from '@/components/inventory/suppliers/SupplierFilters'
import { SuppliersTable } from '@/components/inventory/suppliers/SuppliersTable'
import type { Supplier, SupplierFormData } from '@/types/inventory'

export default function SuppliersPage() {
  const [filters, setFilters] = useState<{
    search?: string
    category?: string
    active?: boolean
  }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

  const {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    reactivateSupplier,
  } = useSuppliers(filters)

  const handleCreateClick = () => {
    setEditingSupplier(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDialogSubmit = async (
    data: SupplierFormData
  ): Promise<boolean> => {
    if (dialogMode === 'create') {
      return await createSupplier(data)
    } else if (editingSupplier) {
      return await updateSupplier(editingSupplier._id, data)
    }
    return false
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingSupplier(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des fournisseurs de stock
          </p>
        </div>
        <Button onClick={handleCreateClick} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Fournisseur
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
      <SupplierFilters onFilterChange={setFilters} />

      {/* Table */}
      <SuppliersTable
        suppliers={suppliers}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={deleteSupplier}
        onReactivate={reactivateSupplier}
      />

      {/* Dialog */}
      <SupplierDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        supplier={editingSupplier}
        mode={dialogMode}
      />
    </div>
  )
}
