import Turnover from "@/models/turnover";

/**
 * B2C Revenue calculation result
 */
export interface B2CRevenueResult {
  ht: number;
  ttc: number;
  tva: number;
}

/**
 * Calculate B2C revenue from Turnover data for a given period
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns B2C revenue breakdown (HT, TTC, TVA)
 */
export async function calculateB2CRevenue(
  startDate: string,
  endDate: string
): Promise<B2CRevenueResult> {
  // Convert YYYY-MM-DD to YYYY/MM/DD for Turnover._id format
  const start = startDate.replace(/-/g, "/");
  const end = endDate.replace(/-/g, "/");

  // Fetch turnovers in the period
  const turnovers = await Turnover.find({
    _id: { $gte: start, $lte: end },
  }).lean();

  let totalHT = 0;
  let totalTTC = 0;
  let totalTVA = 0;

  // Sum all VAT categories
  const vatKeys = ["vat-20", "vat-10", "vat-55", "vat-0"] as const;

  turnovers.forEach((turnover) => {
    vatKeys.forEach((vatKey) => {
      if (turnover[vatKey]) {
        totalHT += turnover[vatKey]["total-ht"] || 0;
        totalTTC += turnover[vatKey]["total-ttc"] || 0;
        totalTVA += turnover[vatKey]["total-taxes"] || 0;
      }
    });
  });

  return {
    ht: Math.round(totalHT * 100) / 100,
    ttc: Math.round(totalTTC * 100) / 100,
    tva: Math.round(totalTVA * 100) / 100,
  };
}
