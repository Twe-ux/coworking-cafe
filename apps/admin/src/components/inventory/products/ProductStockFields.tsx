'use client'

import { Control, useWatch } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductFormData } from '@/types/inventory'

interface ProductStockFieldsProps {
  control: Control<ProductFormData>
}

export function ProductStockFields({ control }: ProductStockFieldsProps) {
  const minStockUnit = useWatch({ control, name: 'minStockUnit' })
  const packagingType = useWatch({ control, name: 'packagingType' })
  const unitsPerPackage = useWatch({ control, name: 'unitsPerPackage' })

  const unitLabel = minStockUnit === 'package' ? 'packs' : 'unités'
  const showConversionHelper = minStockUnit === 'package' && packagingType === 'pack' && unitsPerPackage > 1

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground">Stocks & Seuils</h3>

      {/* Min Stock Unit + Order */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="minStockUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité de référence stock *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unit">Unité</SelectItem>
                  <SelectItem value="package">Conditionnement (pack)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Unité utilisée pour les seuils min/max</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordre d&apos;affichage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                />
              </FormControl>
              <FormDescription>Position dans les listes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Stock thresholds */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock minimum ({unitLabel}) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                />
              </FormControl>
              <FormDescription>Seuil d&apos;alerte</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="maxStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock maximum ({unitLabel}) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                />
              </FormControl>
              <FormDescription>Stock idéal</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Conversion helper */}
      {showConversionHelper && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
          1 pack = {unitsPerPackage} unités. Les seuils ci-dessus sont exprimés en packs.
        </p>
      )}

      {/* Short DLC */}
      <FormField
        control={control}
        name="hasShortDLC"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>DLC courte</FormLabel>
              <FormDescription>Inventaire hebdomadaire requis</FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
