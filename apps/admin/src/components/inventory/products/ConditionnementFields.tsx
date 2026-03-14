"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormData } from "@/types/inventory";
import { Control, useWatch } from "react-hook-form";
import { PriceVatFields } from "./PriceVatFields";

interface ConditionnementFieldsProps {
  control: Control<ProductFormData>;
}

export function ConditionnementFields({ control }: ConditionnementFieldsProps) {
  const packagingType = useWatch({ control, name: "packagingType" });
  const priceType = useWatch({ control, name: "priceType" });
  const showUnitsPerPackage = packagingType === "pack";

  // Determine price label based on priceType
  const getPriceLabel = () => {
    if (packagingType === "unit") return "Prix unitaire HT (€) *";
    return priceType === "unit"
      ? "Prix par unité HT (€) *"
      : "Prix du pack HT (€) *";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conditionnement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Type, Quantity + Unit (conditional), Price + Switch, VAT */}
        <div className="grid gap-4 items-end grid-cols-5">
          <FormField
            control={control}
            name="packagingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pack">Pack/Carton</SelectItem>
                    <SelectItem value="unit">Unité</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showUnitsPerPackage ? (
            <>
              <FormField
                control={control}
                name="unitsPerPackage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                        onFocus={(e) => {
                          // Safari fix: setTimeout to prevent auto-deselect
                          setTimeout(() => e.target.select(), 0)
                        }}
                        onMouseUp={(e) => {
                          // Prevent Safari from deselecting on mouse up
                          e.preventDefault()
                        }}
                        onKeyDown={(e) => {
                          // If Backspace/Delete pressed, select all to allow easy replacement
                          if (e.key === 'Backspace' || e.key === 'Delete') {
                            e.currentTarget.select()
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="packageUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                        <SelectItem value="L">Litre (L)</SelectItem>
                        <SelectItem value="unit">Unité</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <div className="col-span-2" />
          )}

          <PriceVatFields
            control={control}
            priceLabel={getPriceLabel()}
            showPriceTypeSwitch={packagingType === "pack"}
          />
        </div>

        {/* Row 2: Description (optional) */}
        <FormField
          control={control}
          name="packagingDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description du conditionnement (optionnel)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Carton de 8 bouteilles de 1L"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
