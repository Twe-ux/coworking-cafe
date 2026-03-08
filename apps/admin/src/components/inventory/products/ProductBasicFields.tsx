"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
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
import type { ProductFormData, Supplier } from "@/types/inventory";
import { Plus } from "lucide-react";
import { Control } from "react-hook-form";

interface ProductBasicFieldsProps {
  control: Control<ProductFormData>;
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  onCreateSupplier?: () => void;
}

export function ProductBasicFields({
  control,
  suppliers,
  loadingSuppliers,
  onCreateSupplier,
}: ProductBasicFieldsProps) {
  return (
    <>
      {/* Row 1: Supplier & Category */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-5 items-center ">
                <FormLabel>Fournisseur *</FormLabel>
                <FormDescription>
                  Filtré par catégorie sélectionnée
                </FormDescription>
              </div>
              <div className="flex gap-2">
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingSuppliers}
                >
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          loadingSuppliers ? "Chargement..." : "Sélectionner"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Aucun fournisseur pour cette catégorie
                      </div>
                    ) : (
                      suppliers.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {onCreateSupplier && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onCreateSupplier}
                    title="Créer un fournisseur"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Product Name & Supplier Reference */}
      <div className="grid grid-cols-2 gap-4">
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
        <FormField
          control={control}
          name="supplierReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Référence catalogue du fournisseur (optionnel)
              </FormLabel>
              <FormControl>
                <Input placeholder="REF-12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
