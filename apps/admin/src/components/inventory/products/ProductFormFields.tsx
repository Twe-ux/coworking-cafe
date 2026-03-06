'use client'

import { UseFormReturn } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ProductBasicFields } from './ProductBasicFields'
import { ProductPackagingFields } from './ProductPackagingFields'
import { ProductStockFields } from './ProductStockFields'
import type { ProductFormData, Supplier } from '@/types/inventory'

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormData>
  onSubmit: (data: ProductFormData) => void
  suppliers: Supplier[]
  loadingSuppliers: boolean
  loading: boolean
  onCancel: () => void
  mode: 'create' | 'edit'
  onCreateSupplier?: () => void
}

export function ProductFormFields({
  form,
  onSubmit,
  suppliers,
  loadingSuppliers,
  loading,
  onCancel,
  mode,
  onCreateSupplier,
}: ProductFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ProductBasicFields
              control={form.control}
              suppliers={suppliers}
              loadingSuppliers={loadingSuppliers}
              onCreateSupplier={onCreateSupplier}
            />
          </div>
          <div className="space-y-4">
            <ProductPackagingFields control={form.control} />
            <ProductStockFields control={form.control} />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'En cours...' : mode === 'create' ? 'Créer' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
