"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormData } from "@/types/inventory";
import { Control, useWatch } from "react-hook-form";

interface ProductStockFieldsProps {
  control: Control<ProductFormData>;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

const ALERT_HOURS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export function ProductStockFields({ control }: ProductStockFieldsProps) {
  const dlcAlertEnabled = useWatch({ control, name: "dlcAlertConfig.enabled" });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stocks & Seuils</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock thresholds */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock minimum (unités) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                      field.onChange(isNaN(val) ? 0 : val)
                    }}
                    onFocus={(e) => {
                      // Safari fix: setTimeout to prevent auto-deselect
                      setTimeout(() => e.target.select(), 0)
                    }}
                    onMouseUp={(e) => {
                      // Prevent Safari from deselecting on mouse up
                      e.preventDefault()
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                <FormLabel>Stock maximum (unités) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                      field.onChange(isNaN(val) ? 0 : val)
                    }}
                    onFocus={(e) => {
                      // Safari fix: setTimeout to prevent auto-deselect
                      setTimeout(() => e.target.select(), 0)
                    }}
                    onMouseUp={(e) => {
                      // Prevent Safari from deselecting on mouse up
                      e.preventDefault()
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Stock idéal</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* DLC Alert Configuration */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-orange-700">
              Alertes Commandes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 ">
            {/* Enable Alerts */}
            <FormField
              control={control}
              name="dlcAlertConfig.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-2">
                  <FormControl className="mt-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Activer alertes automatiques de commande
                    </FormLabel>
                    <FormDescription>
                      Créer automatiquement des tâches de comptage périodiques
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Days of week (conditional) */}
            {dlcAlertEnabled && (
              <div className="flex gap-4">
                <FormField
                  control={control}
                  name="dlcAlertConfig.days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jours d'alerte *</FormLabel>
                      <FormDescription className="mb-2">
                        Sélectionner un ou plusieurs jours
                      </FormDescription>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label
                            key={day.value}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const currentDays = field.value || [];
                                if (checked) {
                                  field.onChange([...currentDays, day.value]);
                                } else {
                                  field.onChange(
                                    currentDays.filter(
                                      (d: number) => d !== day.value,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label className="cursor-pointer text-sm font-normal">
                              {day.label}
                            </Label>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ALERT_HOURS.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Heure de création de la tâche
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
