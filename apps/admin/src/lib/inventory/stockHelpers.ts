import type { PackagingType, MinStockUnit } from "@/types/inventory"

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
 * Format stock display with packaging context.
 * Shows current stock with equivalent in the other unit.
 *
 * Example: formatStock(15, "pack", 8, "unit") => "15u (1.9 packs)"
 * Example: formatStock(3, "pack", 8, "package") => "3 packs (24u)"
 * Example: formatStock(5, "kg", 1, "unit") => "5 kg"
 */
export function formatStock(
  currentStock: number,
  packagingType: PackagingType,
  unitsPerPackage: number,
  minStockUnit: MinStockUnit
): string {
  // For non-pack types, just show the value with unit label
  if (packagingType !== "pack" || unitsPerPackage <= 1) {
    const unitLabel = getUnitLabel(packagingType)
    return `${currentStock} ${unitLabel}`
  }

  // For packs, show with conversion
  if (minStockUnit === "package") {
    const totalUnits = currentStock * unitsPerPackage
    return `${currentStock} pack${currentStock !== 1 ? "s" : ""} (${totalUnits}u)`
  }

  // minStockUnit === "unit"
  const packs = convertToPackages(currentStock, unitsPerPackage)
  const packsFormatted = Number.isInteger(packs) ? packs : packs.toFixed(1)
  return `${currentStock}u (${packsFormatted} pack${packs !== 1 ? "s" : ""})`
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

function getUnitLabel(packagingType: PackagingType): string {
  const labels: Record<PackagingType, string> = {
    pack: "pack",
    unit: "u",
    kg: "kg",
    L: "L",
  }
  return labels[packagingType]
}
