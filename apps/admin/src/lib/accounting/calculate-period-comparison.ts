import { calculateB2CRevenue } from "./calculate-b2c-revenue";
import { calculateB2BRevenue } from "./calculate-b2b-revenue";
import { calculateComparison } from "./calculate-comparison";
import type { ComparisonResult } from "./calculate-comparison";

/**
 * Period Comparison Result
 */
export interface PeriodComparisonResult {
  current: number;
  previous: number;
  evolution: ComparisonResult;
}

/**
 * Calculate revenue comparison between two periods
 * @param startDateCurrent - Start date of current period (YYYY-MM-DD)
 * @param endDateCurrent - End date of current period (YYYY-MM-DD)
 * @param startDatePrevious - Start date of previous period (YYYY-MM-DD)
 * @param endDatePrevious - End date of previous period (YYYY-MM-DD)
 * @param mode - Calculation mode: 'ht' or 'ttc' (default: 'ht')
 * @returns Comparison with current, previous, and evolution
 */
export async function calculatePeriodComparison(
  startDateCurrent: string,
  endDateCurrent: string,
  startDatePrevious: string,
  endDatePrevious: string,
  mode: 'ht' | 'ttc' = 'ht'
): Promise<PeriodComparisonResult> {
  const [b2cCurrent, b2bCurrent, b2cPrevious, b2bPrevious] = await Promise.all([
    calculateB2CRevenue(startDateCurrent, endDateCurrent),
    calculateB2BRevenue(startDateCurrent, endDateCurrent),
    calculateB2CRevenue(startDatePrevious, endDatePrevious),
    calculateB2BRevenue(startDatePrevious, endDatePrevious),
  ]);

  // Use mode to choose between HT and TTC (B2B is always HT)
  const currentB2C = mode === 'ht' ? b2cCurrent.ht : b2cCurrent.ttc;
  const previousB2C = mode === 'ht' ? b2cPrevious.ht : b2cPrevious.ttc;

  const current = Math.round((currentB2C + b2bCurrent.ht) * 100) / 100;
  const previous = Math.round((previousB2C + b2bPrevious.ht) * 100) / 100;
  const evolution = calculateComparison(current, previous);

  return { current, previous, evolution };
}
