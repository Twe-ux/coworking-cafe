"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import type { InventoryEntryItem, Product } from "@/types/inventory";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ProductInventoryInput } from "./ProductInventoryInput";

interface InventorySupplierSectionProps {
  supplierName: string;
  items: InventoryEntryItem[];
  productsMap: Map<string, Product>;
  isExpanded: boolean;
  onToggle: () => void;
  isFinalized: boolean;
  onQuantityChange: (productId: string, totalUnits: number) => void;
}

export function InventorySupplierSection({
  supplierName,
  items,
  productsMap,
  isExpanded,
  onToggle,
  isFinalized,
  onQuantityChange,
}: InventorySupplierSectionProps) {
  // Calcul des totaux pour le fournisseur
  const stockActuel = items.reduce(
    (sum, item) => sum + item.theoreticalQty * item.unitPriceHT,
    0,
  );
  const saisieInventaire = items.reduce(
    (sum, item) => sum + item.actualQty * item.unitPriceHT,
    0,
  );
  const valeurConso = items.reduce((sum, item) => {
    const variance = item.actualQty - item.theoreticalQty;
    return sum + variance * item.unitPriceHT;
  }, 0);

  return (
    <Card>
      <div
        className="py-2 px-6 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {/* Ligne unique: Chevron + Nom fournisseur + Totaux */}
        <div className="flex items-center text-sm">
          {/* Chevron + Nom + Badge */}
          <div className="flex items-center gap-2 min-w-[435px]">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-semibold">{supplierName}</span>
            <Badge variant="outline" className="text-xs font-normal">
              {items.length} produit{items.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Valeur initial */}
          <div className="text-center min-w-[163px]">
            <span className="text-muted-foreground text-xs">
              Valeur initial:{" "}
            </span>
            <span className="font-mono font-medium">
              {stockActuel.toFixed(2)} €
            </span>
          </div>

          {/* Valeur inventaire */}
          <div className="text-center min-w-[515px]">
            <span className="text-muted-foreground text-xs">
              Valeur inventaire:{" "}
            </span>
            <span className="font-mono font-medium">
              {saisieInventaire.toFixed(2)} €
            </span>
          </div>

          {/* Valeur stock consommé */}
          <div className="text-right ml-auto px-4">
            <span className="text-muted-foreground text-xs">
              Valeur stock consommé:{" "}
            </span>
            <span
              className={`font-mono font-bold ${valeurConso < 0 ? "text-destructive" : valeurConso > 0 ? "text-green-600" : "text-foreground"}`}
            >
              {valeurConso > 0 ? "+" : ""}
              {valeurConso.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <CardContent className="border-t pt-0 pb-0">
          <Table>
            <TableBody>
              {items.map((item) => {
                const product = productsMap.get(item.productId);
                return (
                  <ProductInventoryInput
                    key={item.productId}
                    item={item}
                    packagingType={product?.packagingType ?? "unit"}
                    unitsPerPackage={product?.unitsPerPackage ?? 1}
                    packageUnit={product?.packageUnit}
                    category={product?.category}
                    isFinalized={isFinalized}
                    onQuantityChange={onQuantityChange}
                  />
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
