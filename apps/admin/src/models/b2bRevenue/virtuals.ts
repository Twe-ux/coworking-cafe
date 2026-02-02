import type { B2BRevenueDocument } from "./document";

/**
 * Virtual properties for B2BRevenue
 */
export interface VirtualB2BRevenue {
  /**
   * TVA rate as percentage (calculated from HT and TTC)
   */
  tvaRate: number;
}

/**
 * Calculate TVA rate as percentage
 * Example: HT=100, TTC=120 => TVA rate = 20%
 */
export function getTvaRate(this: B2BRevenueDocument): number {
  if (this.ht === 0) return 0;
  return ((this.ttc - this.ht) / this.ht) * 100;
}
