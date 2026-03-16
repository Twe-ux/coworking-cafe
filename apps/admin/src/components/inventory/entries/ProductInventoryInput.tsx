"use client";

import { NumberInput } from "@/components/inventory/NumberInput";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { getUnitLabel } from "@/lib/inventory/stockHelpers";
import type {
  InventoryEntryItem,
  PackageUnit,
  PackagingType,
  ProductCategory,
} from "@/types/inventory";
import { useCallback, useState } from "react";

interface ProductInventoryInputProps {
  item: InventoryEntryItem;
  packagingType: PackagingType;
  unitsPerPackage: number;
  packageUnit?: PackageUnit;
  category?: ProductCategory;
  isFinalized: boolean;
  onQuantityChange: (productId: string, totalUnits: number) => void;
}

/**
 * Flexible inventory input: pack + loose units or simple unit entry.
 * Displays variance with color coding (red/green/grey).
 */
export function ProductInventoryInput({
  item,
  packagingType,
  unitsPerPackage,
  packageUnit,
  category,
  isFinalized,
  onQuantityChange,
}: ProductInventoryInputProps) {
  const isPack = packagingType === "pack" && unitsPerPackage > 1;
  const unitLabel = getUnitLabel(packageUnit);
  const categoryBadge = getCategoryBadge(category);

  // Decompose actualQty into packs + loose units (initial value only)
  const [packs, setPacks] = useState(() =>
    isPack && item.actualQty > 0
      ? Math.floor(item.actualQty / unitsPerPackage)
      : 0,
  );
  const [units, setUnits] = useState(() =>
    item.actualQty > 0
      ? isPack
        ? Number(
            (
              item.actualQty -
              Math.floor(item.actualQty / unitsPerPackage) * unitsPerPackage
            ).toFixed(2),
          )
        : item.actualQty
      : 0,
  );

  const totalUnits = isPack ? packs * unitsPerPackage + units : units;
  const variance = totalUnits - item.theoreticalQty;
  const varianceValue = variance * item.unitPriceHT;

  const handlePacksChange = useCallback(
    (value: number) => {
      setPacks(value);
      onQuantityChange(item.productId, value * unitsPerPackage + units);
    },
    [units, unitsPerPackage, item.productId, onQuantityChange],
  );

  const handleUnitsChange = useCallback(
    (value: number) => {
      setUnits(value);
      onQuantityChange(
        item.productId,
        isPack ? packs * unitsPerPackage + value : value,
      );
    },
    [packs, isPack, unitsPerPackage, item.productId, onQuantityChange],
  );

  if (isFinalized) {
    return (
      <TableRow className="text-sm">
        <TableCell className="font-medium py-2 w-[320px]">
          <div className="flex items-center justify-between">
            <span className="w-[180px] truncate">{item.productName}</span>
            {categoryBadge && (
              <Badge
                variant="outline"
                className={`text-xs whitespace-nowrap ${categoryBadge.color}`}
              >
                {categoryBadge.label}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono py-2 w-[120px]">
          {item.theoreticalQty} {unitLabel}
        </TableCell>
        <TableCell className="text-center py-2 w-[380px]">
          {/* {isPack && (
            <span className="text-xs text-muted-foreground mr-2">
              {Math.floor(item.actualQty / unitsPerPackage)}P +{" "}
              {Number((item.actualQty % unitsPerPackage).toFixed(1))}
              {unitLabel}
            </span>
          )} */}
          <span className="font-mono font-semibold">
            {item.actualQty} {unitLabel}
          </span>
        </TableCell>
        <TableCell className="text-center py-2 w-[100px]">
          <VarianceBadge variance={variance} />
        </TableCell>
        <TableCell className="text-right font-mono py-2 w-[140px]">
          <VarianceValue value={varianceValue} />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="text-sm hover:bg-transparent">
      <TableCell className="font-medium py-2 w-[320px]">
        <div className="flex items-center justify-between">
          <span className="w-[180px] truncate">{item.productName}</span>
          {categoryBadge && (
            <Badge
              variant="outline"
              className={`text-xs whitespace-nowrap ${categoryBadge.color}`}
            >
              {categoryBadge.label}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center font-mono py-2 w-[120px]">
        {item.theoreticalQty} {unitLabel}
      </TableCell>
      <TableCell className="py-2 w-[380px]">
        <div className="grid grid-cols-2 gap-3 items-center justify-items-center">
          {/* Column 1: Packs (or empty) */}
          <div className="flex items-center gap-1.5 justify-self-end">
            {isPack ? (
              <>
                <NumberInput
                  value={packs}
                  onChange={handlePacksChange}
                  min={0}
                  step="1"
                  placeholder="0"
                  className="w-20 h-8 text-right font-mono text-sm"
                />
                <span className="text-xs font-medium whitespace-nowrap">
                  Packs
                </span>
              </>
            ) : (
              <div />
            )}
          </div>

          {/* Column 2: Units (always aligned) */}
          <div className="flex items-center gap-1.5 justify-self-start">
            <NumberInput
              value={units}
              onChange={handleUnitsChange}
              min={0}
              step="0.1"
              placeholder="0"
              className="w-20 h-8 text-right font-mono text-sm"
            />
            <span className="text-xs font-medium whitespace-nowrap">
              {unitLabel}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-start py-2 w-[100px]">
        <VarianceBadge variance={variance} />
      </TableCell>
      <TableCell className="text-right font-mono py-2 w-[140px]">
        <VarianceValue value={varianceValue} />
      </TableCell>
    </TableRow>
  );
}

// --- Helper functions ---

function getCategoryBadge(category?: ProductCategory) {
  if (!category) return null;

  const categoryMap = {
    food: { label: "Alimentaire", color: "text-orange-700 border-orange-300" },
    cleaning: { label: "Entretien", color: "text-blue-700 border-blue-300" },
    emballage: { label: "Emballage", color: "text-gray-700 border-gray-300" },
    papeterie: {
      label: "Papeterie",
      color: "text-yellow-700 border-yellow-300",
    },
    divers: { label: "Divers", color: "text-gray-700 border-gray-300" },
  };

  return categoryMap[category];
}

// --- Variance display helpers ---

function VarianceBadge({ variance }: { variance: number }) {
  if (variance === 0) return <Badge variant="outline">0</Badge>;
  return (
    <Badge variant={variance < 0 ? "destructive" : "default"}>
      {variance > 0 ? "+" : ""}
      {variance.toFixed(1)}
    </Badge>
  );
}

function VarianceValue({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-muted-foreground">0.00 EUR</span>;
  return (
    <span className={value < 0 ? "text-destructive" : "text-green-600"}>
      {value > 0 ? "+" : ""}
      {value.toFixed(2)} EUR
    </span>
  );
}
