import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * GET /api/accounting/analytics/combined/yearly
 * Get combined breakdown + comparison by month
 *
 * Query params:
 * - currentYear: number (default: current year)
 * - previousYear: number (default: currentYear - 1)
 * - mode: "ht" | "ttc" (default: ht)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const currentYear = parseInt(
      searchParams.get("currentYear") || String(new Date().getFullYear())
    );
    const previousYear = parseInt(
      searchParams.get("previousYear") || String(currentYear - 1)
    );
    const mode = (searchParams.get("mode") as 'ht' | 'ttc') || "ht";

    const rows = [];

    // Calculate revenue for each month
    for (let month = 1; month <= 12; month++) {
      const monthPadded = String(month).padStart(2, "0");

      // Current year dates
      const currentStartDate = `${currentYear}-${monthPadded}-01`;
      const currentLastDay = new Date(currentYear, month, 0).getDate();
      const currentEndDate = `${currentYear}-${monthPadded}-${String(currentLastDay).padStart(2, "0")}`;

      // Previous year dates
      const previousStartDate = `${previousYear}-${monthPadded}-01`;
      const previousLastDay = new Date(previousYear, month, 0).getDate();
      const previousEndDate = `${previousYear}-${monthPadded}-${String(previousLastDay).padStart(2, "0")}`;

      // Calculate revenues for current year
      const [currentB2C, currentB2B, previousB2C, previousB2B] = await Promise.all([
        calculateB2CRevenue(currentStartDate, currentEndDate),
        calculateB2BRevenue(currentStartDate, currentEndDate),
        calculateB2CRevenue(previousStartDate, previousEndDate),
        calculateB2BRevenue(previousStartDate, previousEndDate),
      ]);

      const currentB2CValue = mode === 'ht' ? currentB2C.ht : currentB2C.ttc;
      const currentB2BValue = mode === 'ht' ? currentB2B.ht : currentB2B.ttc;
      const currentTotal = currentB2CValue + currentB2BValue;

      const previousB2CValue = mode === 'ht' ? previousB2C.ht : previousB2C.ttc;
      const previousB2BValue = mode === 'ht' ? previousB2B.ht : previousB2B.ttc;
      const previousTotal = previousB2CValue + previousB2BValue;

      const evolution = calculateComparison(currentTotal, previousTotal);

      rows.push({
        period: MONTH_NAMES[month - 1],
        label: MONTH_NAMES[month - 1],
        current: {
          b2c: currentB2CValue,
          b2b: currentB2BValue,
          total: currentTotal,
        },
        previous: {
          b2c: previousB2CValue,
          b2b: previousB2BValue,
          total: previousTotal,
        },
        evolution,
      });
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error calculating combined yearly:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate combined yearly",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
