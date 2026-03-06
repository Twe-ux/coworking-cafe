'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ProductFormFields } from './ProductFormFields'
import { SupplierDialog } from '../suppliers/SupplierDialog'
import type { Product, ProductFormData, Supplier, SupplierFormData } from '@/types/inventory'

// Validation schema
const productSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  category: z.enum(['food', 'cleaning', 'emballage', 'papeterie', 'divers']),
  unit: z.enum(['kg', 'L', 'unit', 'pack']),
  unitPriceHT: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
  vatRate: z.number().min(0).max(100),
  supplierId: z.string().min(1, 'Sélectionnez un fournisseur'),
  supplierReference: z.string().optional(),
  packagingType: z.enum(['pack', 'unit', 'kg', 'L']),
  unitsPerPackage: z.number().min(1, 'Minimum 1 unité par conditionnement'),
  packagingDescription: z.string().optional(),
  minStockUnit: z.enum(['package', 'unit']),
  order: z.number().min(0),
  minStock: z.number().min(0),
  maxStock: z.number().min(0),
  hasShortDLC: z.boolean(),
}).refine(
  (data) => data.minStock < data.maxStock,
  {
    message: 'Le stock minimum doit être inférieur au stock maximum',
    path: ['maxStock'],
  }
)

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<boolean>
  product?: Product | null
  mode?: 'create' | 'edit'
}

export function ProductDialog({
  open,
  onClose,
  onSubmit,
  product,
  mode = 'create',
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'food',
      unit: 'kg',
      unitPriceHT: 0,
      vatRate: 5.5,
      supplierId: '',
      supplierReference: '',
      packagingType: 'unit',
      unitsPerPackage: 1,
      packagingDescription: '',
      minStockUnit: 'unit',
      order: 0,
      minStock: 0,
      maxStock: 10,
      hasShortDLC: false,
    },
  })

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true)
    try {
      const res = await fetch('/api/inventory/suppliers?active=true')
      const data = await res.json()
      if (data.success && data.data) {
        setSuppliers(data.data)
      }
    } finally {
      setLoadingSuppliers(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchSuppliers()
    }
  }, [open, fetchSuppliers])

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      form.reset({
        name: product.name,
        category: product.category,
        unit: product.unit,
        unitPriceHT: product.unitPriceHT,
        vatRate: product.vatRate,
        supplierId: product.supplierId,
        supplierReference: product.supplierReference || '',
        packagingType: product.packagingType || 'unit',
        unitsPerPackage: product.unitsPerPackage || 1,
        packagingDescription: product.packagingDescription || '',
        minStockUnit: product.minStockUnit || 'unit',
        order: product.order || 0,
        minStock: product.minStock,
        maxStock: product.maxStock,
        hasShortDLC: product.hasShortDLC,
      })
    } else if (mode === 'create') {
      form.reset()
    }
  }, [mode, product, form])

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const success = await onSubmit(data)
      if (success) {
        toast({
          title: 'Succès',
          description:
            mode === 'create'
              ? 'Produit créé avec succès'
              : 'Produit mis à jour avec succès',
        })
        onClose()
        form.reset()
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const categoryWatch = form.watch('category')
  const filteredSuppliers = suppliers.filter((s) =>
    s.categories.includes(categoryWatch)
  )

  // Handle supplier creation
  const handleCreateSupplier = () => {
    setSupplierDialogOpen(true)
  }

  const handleSupplierSubmit = async (
    data: SupplierFormData
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success && result.data) {
        toast({
          title: 'Succès',
          description: 'Fournisseur créé avec succès',
        })

        // Refresh suppliers list
        await fetchSuppliers()

        // Auto-select the new supplier
        form.setValue('supplierId', result.data._id)

        setSupplierDialogOpen(false)
        return true
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        })
        return false
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du fournisseur',
        variant: 'destructive',
      })
      return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nouveau Produit' : 'Modifier le Produit'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Créer un nouveau produit de stock'
              : 'Modifier les informations du produit'}
          </DialogDescription>
        </DialogHeader>

        <ProductFormFields
          form={form}
          onSubmit={handleSubmit}
          suppliers={filteredSuppliers}
          loadingSuppliers={loadingSuppliers}
          loading={loading}
          onCancel={onClose}
          mode={mode}
          onCreateSupplier={handleCreateSupplier}
        />
      </DialogContent>

      {/* Supplier Dialog */}
      <SupplierDialog
        open={supplierDialogOpen}
        onClose={() => setSupplierDialogOpen(false)}
        onSubmit={handleSupplierSubmit}
        mode="create"
      />
    </Dialog>
  )
}
