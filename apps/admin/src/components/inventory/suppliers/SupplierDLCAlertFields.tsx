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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { SupplierFormData } from '@/types/inventory'

interface SupplierDLCAlertFieldsProps {
  control: Control<SupplierFormData>
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
]

export function SupplierDLCAlertFields({ control }: SupplierDLCAlertFieldsProps) {
  const dlcAlertEnabled = useWatch({ control, name: 'dlcAlertConfig.enabled' })

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700">Alertes DLC (pour tous les produits)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable Alerts */}
        <FormField
          control={control}
          name="dlcAlertConfig.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Activer alertes DLC pour ce fournisseur</FormLabel>
                <FormDescription>
                  Tous les produits de ce fournisseur auront des alertes DLC automatiques
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Days of week (conditional) */}
        {dlcAlertEnabled && (
          <>
            <FormField
              control={control}
              name="dlcAlertConfig.days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jours d'alerte *</FormLabel>
                  <FormDescription className="mb-2">Sélectionner un ou plusieurs jours</FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={field.value?.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const currentDays = field.value || []
                            if (checked) {
                              field.onChange([...currentDays, day.value])
                            } else {
                              field.onChange(currentDays.filter((d: number) => d !== day.value))
                            }
                          }}
                        />
                        <Label className="cursor-pointer text-sm font-normal">{day.label}</Label>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="dlcAlertConfig.time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d'alerte *</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-40"
                    />
                  </FormControl>
                  <FormDescription>Heure de création de la tâche (format 24h)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
