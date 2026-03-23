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

// Create dynamic validation schema based on supplier settings
const createProductSchema = (requiresStockManagement: boolean) => {
  const baseSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    category: z.enum(['food', 'cleaning', 'emballage', 'papeterie', 'divers']),
    unitPriceHT: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
    vatRate: z.number().min(0).max(100),
    supplierId: z.string().min(1, 'Sélectionnez un fournisseur'),
    supplierReference: z.string().optional(),
    packagingType: z.enum(['pack', 'unit']),
    priceType: z.enum(['unit', 'pack']),
    unitsPerPackage: z.number().min(1, 'Minimum 1 unité par conditionnement'),
    packageUnit: z.enum(['kg', 'L', 'unit']).optional(),
    packagingDescription: z.string().optional(),
    minStock: requiresStockManagement
      ? z.number().min(0, 'Le stock minimum doit être >= 0')
      : z.number().optional(),
    maxStock: requiresStockManagement
      ? z.number().min(0, 'Le stock maximum doit être >= 0')
      : z.number().optional(),
    dlcAlertConfig: z.object({
      enabled: z.boolean(),
      days: z.array(z.number().min(0).max(6)),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
    }).optional(),
    criticalStockAlert: z.boolean().optional(),
  })

  // Add stock validation only if required
  if (requiresStockManagement) {
    return baseSchema
      .refine(
        (data) => (data.minStock ?? 0) < (data.maxStock ?? 0),
        {
          message: 'Le stock minimum doit être inférieur au stock maximum',
          path: ['maxStock'],
        }
      )
      .refine(
        (data) => !data.dlcAlertConfig?.enabled || (data.dlcAlertConfig?.days?.length ?? 0) > 0,
        {
          message: 'Sélectionnez au moins un jour pour les alertes',
          path: ['dlcAlertConfig.days'],
        }
      )
  }

  return baseSchema.refine(
    (data) => !data.dlcAlertConfig?.enabled || (data.dlcAlertConfig?.days?.length ?? 0) > 0,
    {
      message: 'Sélectionnez au moins un jour pour les alertes',
      path: ['dlcAlertConfig.days'],
    }
  )
}

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<boolean>
  product?: Product | null
  mode?: 'create' | 'edit'
}

// Default form values (used for reset)
const defaultFormValues: ProductFormData = {
  name: '',
  category: 'food',
  unitPriceHT: undefined as unknown as number,
  vatRate: 5.5,
  supplierId: '',
  supplierReference: '',
  packagingType: 'unit',
  priceType: 'unit',
  unitsPerPackage: 1,
  packageUnit: 'unit',
  packagingDescription: '',
  minStock: undefined as unknown as number,
  maxStock: undefined as unknown as number,
  dlcAlertConfig: {
    enabled: false,
    days: [],
    time: '09:00',
  },
  criticalStockAlert: false,
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

  // Watch selected supplier to adjust validation
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId)
  const requiresStockManagement = selectedSupplier?.requiresStockManagement ?? true

  const form = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema(requiresStockManagement)),
    defaultValues: defaultFormValues,
  })

  // Track supplier changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'supplierId' && value.supplierId) {
        setSelectedSupplierId(value.supplierId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

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

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (mode === 'edit' && product) {
      // Calculate display price based on priceType
      // In DB we store the real unit price, but we need to show the price according to priceType
      const priceType = product.priceType || 'unit'
      const unitsPerPackage = product.unitsPerPackage || 1
      let displayPrice = product.unitPriceHT

      if (priceType === 'pack' && unitsPerPackage > 1) {
        // User entered price per pack, so show pack price
        displayPrice = product.unitPriceHT * unitsPerPackage
      }
      // If priceType === 'unit', show unit price as-is

      form.reset({
        name: product.name,
        category: product.category,
        unitPriceHT: displayPrice,
        vatRate: product.vatRate,
        supplierId: product.supplierId,
        supplierReference: product.supplierReference || '',
        packagingType: product.packagingType || 'unit',
        priceType: product.priceType || 'unit',
        unitsPerPackage: product.unitsPerPackage || 1,
        packageUnit: product.packageUnit || 'unit',
        packagingDescription: product.packagingDescription || '',
        minStock: product.minStock,
        maxStock: product.maxStock,
        dlcAlertConfig: product.dlcAlertConfig || {
          enabled: false,
          days: [],
          time: '09:00',
        },
        criticalStockAlert: product.criticalStockAlert || false,
      })
    } else if (mode === 'create') {
      // Reset to default values explicitly
      form.reset(defaultFormValues)
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
        form.reset(defaultFormValues)
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
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
          selectedSupplier={selectedSupplier}
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
