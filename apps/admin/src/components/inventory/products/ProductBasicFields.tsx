'use client'

import { Control } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProductFormData, Supplier } from '@/types/inventory'

interface ProductBasicFieldsProps {
  control: Control<ProductFormData>
  suppliers: Supplier[]
  loadingSuppliers: boolean
  onCreateSupplier?: () => void
}

export function ProductBasicFields({
  control,
  suppliers,
  loadingSuppliers,
  onCreateSupplier,
}: ProductBasicFieldsProps) {
  return (
    <>
      {/* Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du produit *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Café, Détergent..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category & Unit */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="food">Alimentation</SelectItem>
                  <SelectItem value="cleaning">Entretien</SelectItem>
                  <SelectItem value="emballage">Emballage</SelectItem>
                  <SelectItem value="papeterie">Papeterie</SelectItem>
                  <SelectItem value="divers">Divers</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="unit">Unité</SelectItem>
                  <SelectItem value="pack">Paquet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Price & VAT */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="unitPriceHT"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix unitaire HT (€) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="vatRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TVA (%) *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseFloat(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5.5">5,5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Supplier */}
      <FormField
        control={control}
        name="supplierId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fournisseur *</FormLabel>
            <div className="flex gap-2">
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingSuppliers}>
                <FormControl>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={loadingSuppliers ? 'Chargement...' : 'Sélectionner'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Aucun fournisseur pour cette catégorie
                    </div>
                  ) : (
                    suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {onCreateSupplier && (
                <Button type="button" variant="outline" size="icon" onClick={onCreateSupplier} title="Créer un fournisseur">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormDescription>Filtré par catégorie sélectionnée</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Supplier Reference */}
      <FormField
        control={control}
        name="supplierReference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Référence fournisseur</FormLabel>
            <FormControl>
              <Input placeholder="REF-12345" {...field} />
            </FormControl>
            <FormDescription>Référence catalogue du fournisseur (optionnel)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
