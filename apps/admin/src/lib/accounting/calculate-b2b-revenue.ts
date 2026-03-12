import B2BRevenue from "@/models/accounting/B2BRevenue";

/**
 * B2B Revenue calculation result
 */
export interface B2BRevenueResult {
  ht: number;
  ttc: number; // TTC calculated from HT + VAT rates
  tva: number; // TVA amount (TTC - HT)
}

/**
 * Calculate B2B revenue from B2B Revenue entries for a given period
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns B2B revenue (HT only)
 */
export async function calculateB2BRevenue(
  startDate: string,
  endDate: string
): Promise<B2BRevenueResult> {
  let totalHT = 0;
  let totalHT_5_5 = 0;
  let totalHT_10 = 0;
  let totalHT_20 = 0;

  // 1. Find all standard B2B revenue entries where serviceDate is within the period
  const standardEntries = await B2BRevenue.find({
    serviceDate: { $gte: startDate, $lte: endDate, $ne: '' },
    isMonthlyDistribution: { $ne: true },
  }).lean();

  for (const entry of standardEntries) {
    totalHT += entry.revenueHT || 0;
    totalHT_5_5 += entry.revenueHT_5_5 || 0;
    totalHT_10 += entry.revenueHT_10 || 0;
    totalHT_20 += entry.revenueHT_20 || 0;
  }

  // 2. Find all monthly distribution entries that overlap with the period
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);

  // Get all months that could overlap with the period
  const monthsToCheck = [];
  for (let year = startYear; year <= endYear; year++) {
    const firstMonth = year === startYear ? startMonth : 1;
    const lastMonth = year === endYear ? endMonth : 12;
    for (let month = firstMonth; month <= lastMonth; month++) {
      monthsToCheck.push(`${year}-${String(month).padStart(2, '0')}`);
    }
  }

  const monthlyEntries = await B2BRevenue.find({
    isMonthlyDistribution: true,
    distributionMonth: { $in: monthsToCheck },
  }).lean();

  // For each monthly entry, calculate the portion that falls within the requested period
  for (const entry of monthlyEntries) {
    if (!entry.distributionMonth) continue;

    const [year, month] = entry.distributionMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Calculate overlap between requested period and distribution month
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const overlapStart = startDate > monthStart ? startDate : monthStart;
    const overlapEnd = endDate < monthEnd ? endDate : monthEnd;

    if (overlapStart <= overlapEnd) {
      // Calculate number of days in overlap
      const overlapStartDate = new Date(overlapStart);
      const overlapEndDate = new Date(overlapEnd);
      const daysOverlap = Math.floor((overlapEndDate.getTime() - overlapStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Calculate portion of revenue for this period (by VAT rate)
      const dailyRevenue = (entry.revenueHT || 0) / daysInMonth;
      const dailyRevenue_5_5 = (entry.revenueHT_5_5 || 0) / daysInMonth;
      const dailyRevenue_10 = (entry.revenueHT_10 || 0) / daysInMonth;
      const dailyRevenue_20 = (entry.revenueHT_20 || 0) / daysInMonth;

      const portionRevenue = dailyRevenue * daysOverlap;
      const portionRevenue_5_5 = dailyRevenue_5_5 * daysOverlap;
      const portionRevenue_10 = dailyRevenue_10 * daysOverlap;
      const portionRevenue_20 = dailyRevenue_20 * daysOverlap;

      totalHT += portionRevenue;
      totalHT_5_5 += portionRevenue_5_5;
      totalHT_10 += portionRevenue_10;
      totalHT_20 += portionRevenue_20;
    }
  }

  // Calculate TTC by applying VAT rates to HT amounts
  const totalTTC_5_5 = totalHT_5_5 * 1.055;  // TVA 5.5%
  const totalTTC_10 = totalHT_10 * 1.10;     // TVA 10%
  const totalTTC_20 = totalHT_20 * 1.20;     // TVA 20%

  const totalTTC = totalTTC_5_5 + totalTTC_10 + totalTTC_20;
  const totalTVA = totalTTC - totalHT;

  return {
    ht: totalHT,
    ttc: totalTTC,
    tva: totalTVA,
  };
}
