"use client";

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
import { Switch } from "@/components/ui/switch";
import type { ProductFormData } from "@/types/inventory";
import { Control } from "react-hook-form";

interface PriceVatFieldsProps {
  control: Control<ProductFormData>;
  priceLabel: string;
  showPriceTypeSwitch: boolean;
}

export function PriceVatFields({
  control,
  priceLabel,
  showPriceTypeSwitch,
}: PriceVatFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="unitPriceHT"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>{priceLabel}</FormLabel>
              {showPriceTypeSwitch && (
                <FormField
                  control={control}
                  name="priceType"
                  render={({ field: switchField }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={switchField.value === "pack"}
                          onCheckedChange={(checked) =>
                            switchField.onChange(checked ? "pack" : "unit")
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
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
                onKeyDown={(e) => {
                  // If Backspace/Delete pressed and value is 0, select all to delete
                  if ((e.key === 'Backspace' || e.key === 'Delete') && parseFloat(e.currentTarget.value) === 0) {
                    e.currentTarget.select()
                  }
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
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
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5,5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
