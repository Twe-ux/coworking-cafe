'use client'

import { Control } from 'react-hook-form'
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
import type { ProductFormData } from '@/types/inventory'

interface ProductStockFieldsProps {
  control: Control<ProductFormData>
}

export function ProductStockFields({ control }: ProductStockFieldsProps) {
  return (
    <>
      {/* Stock thresholds */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock minimum *</FormLabel>
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
              <FormLabel>Stock maximum *</FormLabel>
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

      {/* Short DLC */}
      <FormField
        control={control}
        name="hasShortDLC"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>DLC courte</FormLabel>
              <FormDescription>
                Inventaire hebdomadaire requis
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  )
}
