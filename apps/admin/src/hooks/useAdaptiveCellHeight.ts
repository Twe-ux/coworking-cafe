import { useMemo } from "react";

/**
 * Hook to calculate adaptive cell height based on number of items (employees)
 *
 * Formula: Math.max(120, 40 + itemCount * 24)
 * - Minimum height: 120px
 * - Base height: 40px (padding + header + margin)
 * - Per item: 24px (20px row + 4px gap)
 *
 * @param itemCount - Number of items to display (e.g., employees)
 * @returns Calculated cell height in pixels
 *
 * @example
 * const cellHeight = useAdaptiveCellHeight(employees.length);
 * // 3 employees → 40 + (3 × 24) = 112 → 120px (minimum)
 * // 5 employees → 40 + (5 × 24) = 160px
 * // 10 employees → 40 + (10 × 24) = 280px
 */
export function useAdaptiveCellHeight(itemCount: number): number {
  return useMemo(() => {
    // Base height: 40px (16px padding + 20px header + 4px margin)
    // Per item: 24px (20px row height + 4px gap)
    const BASE_HEIGHT = 40;
    const PER_ITEM_HEIGHT = 24;
    const MIN_HEIGHT = 120;

    return Math.max(MIN_HEIGHT, BASE_HEIGHT + itemCount * PER_ITEM_HEIGHT);
  }, [itemCount]);
}
