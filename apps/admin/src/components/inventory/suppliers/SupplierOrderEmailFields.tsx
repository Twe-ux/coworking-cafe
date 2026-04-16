'use client'

import type { Control } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type { SupplierFormData } from '@/types/inventory'

interface SupplierOrderEmailFieldsProps {
  control: Control<SupplierFormData>
}

export function SupplierOrderEmailFields({ control }: SupplierOrderEmailFieldsProps) {
  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Modèle de commande email</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Colonnes affichées dans l&apos;email envoyé au fournisseur
        </p>
      </div>

      {/* Référence */}
      <FormField
        control={control}
        name="orderEmailConfig.showReference"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-0.5">
              <FormLabel className="font-normal">Afficher la colonne Référence</FormLabel>
              <FormDescription>
                Visible uniquement si une référence est saisie sur le produit
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {/* Quantité — Type vs Unité */}
      <FormField
        control={control}
        name="orderEmailConfig.quantityDisplay"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Format de la quantité</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? 'type'}
                onValueChange={field.onChange}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="type" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Type — affiche le conditionnement (<span className="text-gray-500">3 packs, 5 cartons</span>)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="unit" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Unité — affiche l'unité du produit (<span className="text-gray-500">3 kg, 2 L, 5 unités</span>)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
