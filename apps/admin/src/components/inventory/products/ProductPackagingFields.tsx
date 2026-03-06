'use client'

import { Control, useWatch, useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductFormData } from '@/types/inventory'

interface ProductPackagingFieldsProps {
  control: Control<ProductFormData>
}

export function ProductPackagingFields({ control }: ProductPackagingFieldsProps) {
  const { setValue } = useFormContext<ProductFormData>()
  const packagingType = useWatch({ control, name: 'packagingType' })
  const isPack = packagingType === 'pack'

  const handlePackagingTypeChange = (value: string) => {
    if (value !== 'pack') {
      setValue('unitsPerPackage', 1)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground">Conditionnement</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Packaging Type */}
        <FormField
          control={control}
          name="packagingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val)
                  handlePackagingTypeChange(val)
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unit">Unité</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="L">Litre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Units Per Package */}
        <FormField
          control={control}
          name="unitsPerPackage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unités / conditionnement *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  disabled={!isPack}
                  {...field}
                  value={isPack ? field.value : 1}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              {!isPack && (
                <FormDescription>Modifiable uniquement pour les packs</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Packaging Description */}
      <FormField
        control={control}
        name="packagingDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description du conditionnement</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Carton de 8 bouteilles de 1L"
                className="resize-none"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
