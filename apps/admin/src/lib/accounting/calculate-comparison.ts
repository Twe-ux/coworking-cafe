/**
 * Comparison result for revenue trends
 */
export interface ComparisonResult {
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

/**
 * Calculate comparison between current and previous revenue
 * @param current - Current period revenue
 * @param previous - Previous period revenue
 * @returns Comparison with amount, percentage, and trend
 */
export function calculateComparison(current: number, previous: number): ComparisonResult {
  const amount = current - previous;
  const percentage = previous > 0 ? (amount / previous) * 100 : 0;

  return {
    amount: Math.round(amount * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    trend: amount > 0 ? "up" : amount < 0 ? "down" : "stable",
  };
}

/**
 * Period dates result
 */
export interface PeriodDates {
  startDate: string;
  endDate: string;
}

/**
 * Get previous period dates based on period type
 * @param date - Reference date
 * @param type - Period type (month or week)
 * @returns Previous period start and end dates (YYYY-MM-DD)
 */
export function getPreviousPeriod(date: Date, type: "month" | "week"): PeriodDates {
  const d = new Date(date);

  if (type === "month") {
    // Previous month
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    // First day of previous month
    const startDate = new Date(year, month, 1);

    // Last day of previous month
    const endDate = new Date(year, month + 1, 0);

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  } else {
    // Previous week
    const startDate = new Date(d);
    startDate.setDate(d.getDate() - 7);

    const endDate = new Date(d);
    endDate.setDate(d.getDate() - 1);

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  }
}

/**
 * Get year-ago period dates
 * @param startDate - Current period start date (YYYY-MM-DD)
 * @param endDate - Current period end date (YYYY-MM-DD)
 * @returns Year-ago period dates
 */
export function getYearAgoPeriod(startDate: string, endDate: string): PeriodDates {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Subtract 1 year
  start.setFullYear(start.getFullYear() - 1);
  end.setFullYear(end.getFullYear() - 1);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

/**
 * Format date to YYYY-MM-DD
 * @param date - Date object
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
