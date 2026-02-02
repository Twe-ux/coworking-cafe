import type { B2BRevenueDocument } from "./document";

/**
 * Instance methods for B2BRevenue model
 */
export interface B2BRevenueMethods {
  /**
   * Calculate TVA amount (TTC - HT)
   */
  calculateTVA(): number;

  /**
   * Get formatted date DD/MM/YYYY
   */
  getFormattedDate(): string;
}

/**
 * Calculate TVA (TTC - HT)
 */
export function calculateTVA(this: B2BRevenueDocument): number {
  return this.ttc - this.ht;
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
export function getFormattedDate(this: B2BRevenueDocument): string {
  const [year, month, day] = this.date.split('-');
  return `${day}/${month}/${year}`;
}
