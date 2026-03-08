import type { PackagingType, PackageUnit, MinStockUnit } from "@/types/inventory"

/**
 * Convert a quantity in packages to individual units.
 * For "unit" or weight-based types (kg, L), returns quantity as-is.
 *
 * Example: convertToUnits(3, "pack", 8) => 24
 * Example: convertToUnits(5, "unit", 1) => 5
 */
export function convertToUnits(
  quantity: number,
  packagingType: PackagingType,
  unitsPerPackage: number
): number {
  if (packagingType === "pack") {
    return quantity * unitsPerPackage
  }
  return quantity
}

/**
 * Convert a quantity in individual units to packages.
 * Returns a fractional number (not rounded).
 *
 * Example: convertToPackages(15, 8) => 1.875
 * Example: convertToPackages(24, 8) => 3
 */
export function convertToPackages(
  quantity: number,
  unitsPerPackage: number
): number {
  if (unitsPerPackage <= 0) return quantity
  return quantity / unitsPerPackage
}

/**
 * Format stock display with unit label.
 *
 * Example: formatStock(150, "kg") => "150 kg"
 * Example: formatStock(30, "unit") => "30 U"
 * Example: formatStock(45, "L") => "45 L"
 */
export function formatStock(
  currentStock: number,
  packageUnit?: PackageUnit
): string {
  const unitLabel = getUnitLabel(packageUnit)
  return `${currentStock} ${unitLabel}`
}

/**
 * Calculate order suggestion considering packaging.
 * Rounds up to nearest complete package when using pack type.
 *
 * Example:
 * - currentStock = 15 units, min = 2 packs (16u), max = 6 packs (48u)
 * - unitsPerPackage = 8
 * - currentPacks = 15/8 = 1.875
 * - neededPacks = ceil(6 - 1.875) = 5
 * - Result: { suggestedPacks: 5, suggestedUnits: 40, totalAfter: 55 }
 */
export function calculateOrderSuggestion(
  currentStock: number,
  minStock: number,
  maxStock: number,
  minStockUnit: MinStockUnit,
  unitsPerPackage: number
): OrderSuggestion {
  // Convert min/max to units for comparison
  const minInUnits = minStockUnit === "package"
    ? minStock * unitsPerPackage
    : minStock
  const maxInUnits = minStockUnit === "package"
    ? maxStock * unitsPerPackage
    : maxStock

  // No order needed if above minimum
  if (currentStock >= minInUnits) {
    return {
      needsOrder: false,
      suggestedPacks: 0,
      suggestedUnits: 0,
      totalAfterOrder: currentStock,
    }
  }

  // Calculate how many units to reach max
  const unitsNeeded = maxInUnits - currentStock

  if (unitsPerPackage <= 1) {
    return {
      needsOrder: true,
      suggestedPacks: unitsNeeded,
      suggestedUnits: unitsNeeded,
      totalAfterOrder: currentStock + unitsNeeded,
    }
  }

  // Round up to complete packs
  const packsNeeded = Math.ceil(unitsNeeded / unitsPerPackage)
  const unitsOrdered = packsNeeded * unitsPerPackage

  return {
    needsOrder: true,
    suggestedPacks: packsNeeded,
    suggestedUnits: unitsOrdered,
    totalAfterOrder: currentStock + unitsOrdered,
  }
}

// --- Types ---

export interface OrderSuggestion {
  needsOrder: boolean
  suggestedPacks: number
  suggestedUnits: number
  totalAfterOrder: number
}

// --- Internal helpers ---

export function getUnitLabel(packageUnit?: PackageUnit): string {
  if (!packageUnit || packageUnit === "unit") return "U"
  if (packageUnit === "kg") return "kg"
  if (packageUnit === "L") return "L"
  return "U"
}
