"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatStock } from "@/lib/inventory/stockHelpers";
import type { Product } from "@/types/inventory";
import { AlertTriangle, Edit, RefreshCw, Trash2, Bell } from "lucide-react";
import { LowStockBadge } from "./LowStockBadge";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Alimentation",
  cleaning: "Entretien",
  emballage: "Emballage",
  papeterie: "Papeterie",
  divers: "Divers",
};

const getCategoryBadgeClass = (category: string) => {
  const colors: Record<string, string> = {
    food: "border-orange-500 bg-orange-50 text-orange-700",
    cleaning: "border-blue-500 bg-blue-50 text-blue-700",
    emballage: "border-purple-500 bg-purple-50 text-purple-700",
    papeterie: "border-pink-500 bg-pink-50 text-pink-700",
    divers: "border-gray-500 bg-gray-50 text-gray-700",
  };
  return colors[category] || "border-gray-500 bg-gray-50 text-gray-700";
};

const getUnitLabel = (packageUnit?: string) => {
  if (!packageUnit) return "U";
  if (packageUnit === "kg") return "kg";
  if (packageUnit === "L") return "L";
  return "U";
};

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onReactivate: (id: string) => Promise<boolean>;
  onDeclareLoss?: (product: Product) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDeactivate,
  onReactivate,
  onDeclareLoss,
}: ProductCardProps) {
  // Display stock with appropriate unit label
  const stockDisplay = formatStock(product.currentStock, product.packageUnit);

  const packagingLabel = product.packagingType === "pack" ? "Pack" : "Unité";

  return (
    <div
      className={`grid grid-cols-[220px_160px_140px_1fr_100px_auto] items-center gap-4 px-4 py-1.5 border-b last:border-b-0 hover:bg-muted/50 transition-colors  ${
        !product.isActive ? "opacity-60" : ""
      }`}
    >
      {/* Product name */}
      <div>
        <span className="font-semibold text-sm">{product.name}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs px-2 py-0.5 pointer-events-none ${getCategoryBadgeClass(product.category)}`}
        >
          {CATEGORY_LABELS[product.category]}
        </Badge>
        {product.hasShortDLC && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            DLC
          </Badge>
        )}
        {!product.isActive && (
          <Badge variant="destructive" className="text-xs px-2 py-0.5">
            Inactif
          </Badge>
        )}
      </div>

      {/* Packaging info */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Type:</span>
        <span className="text-sm font-medium">{packagingLabel}</span>
        {(product.packagingType === "pack" ||
          product.packagingType === "unit") &&
          product.unitsPerPackage > 1 && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-orange-600 font-semibold">
                ×
              </span>
              <span className="text-sm text-orange-600 font-semibold font-mono text-right w-6">
                {product.unitsPerPackage}
              </span>
              <span className="text-sm text-orange-600 font-semibold w-6">
                {getUnitLabel(product.packageUnit)}
              </span>
            </div>
          )}
      </div>

      {/* Stock info - All on one line */}
      <div className="flex items-center gap-6 ml-12">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Min:
          </span>
          <span className="text-sm font-mono text-right w-8">{product.minStock}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Max:
          </span>
          <span className="text-sm font-mono text-right w-8">{product.maxStock}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Stock:
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-semibold text-foreground text-right w-8">
              {product.currentStock}
            </span>
            <span className="text-sm font-semibold w-6">
              {getUnitLabel(product.packageUnit)}
            </span>
            <div className="w-28">
              <LowStockBadge
                currentStock={product.currentStock}
                minStock={product.minStock}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DLC Alert Badge */}
      <div className="flex items-center justify-center">
        {product.dlcAlertConfig?.enabled && (
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 border-amber-500 bg-amber-50 text-amber-700"
            title={`Alerte configurée : ${product.dlcAlertConfig.time || '09:00'}`}
          >
            <Bell className="h-3 w-3 mr-1" />
            Alerte
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          onClick={() => onEdit(product)}
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {onDeclareLoss && product.isActive && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDeclareLoss(product)}
            title="Declarer une perte"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        )}
        {product.isActive ? (
          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDeactivate(product)}
            title="Désactiver"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            onClick={() => onReactivate(product._id)}
            title="Réactiver"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
