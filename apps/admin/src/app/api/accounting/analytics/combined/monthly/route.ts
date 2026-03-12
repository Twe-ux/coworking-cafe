import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/**
 * GET /api/accounting/analytics/combined/monthly
 * Get combined breakdown + comparison by day for a given month
 *
 * Query params:
 * - year: number (default: current year)
 * - month: number (1-12, default: current month)
 * - previousYear: number (default: year - 1)
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
    const now = new Date();
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const previousYear = parseInt(searchParams.get("previousYear") || String(year - 1));
    const mode = (searchParams.get("mode") as 'ht' | 'ttc') || "ht";

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid month: must be between 1 and 12",
        },
        { status: 400 }
      );
    }

    const rows = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPadded = String(month).padStart(2, "0");

    // Calculate revenue for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPadded = String(day).padStart(2, "0");

      const currentDate = `${year}-${monthPadded}-${dayPadded}`;
      const previousDate = `${previousYear}-${monthPadded}-${dayPadded}`;

      // Calculate revenues
      const [currentB2C, currentB2B, previousB2C, previousB2B] = await Promise.all([
        calculateB2CRevenue(currentDate, currentDate),
        calculateB2BRevenue(currentDate, currentDate),
        calculateB2CRevenue(previousDate, previousDate),
        calculateB2BRevenue(previousDate, previousDate),
      ]);

      const currentB2CValue = mode === 'ht' ? currentB2C.ht : currentB2C.ttc;
      const currentB2BValue = mode === 'ht' ? currentB2B.ht : currentB2B.ttc;
      const currentTotal = currentB2CValue + currentB2BValue;

      const previousB2CValue = mode === 'ht' ? previousB2C.ht : previousB2C.ttc;
      const previousB2BValue = mode === 'ht' ? previousB2B.ht : previousB2B.ttc;
      const previousTotal = previousB2CValue + previousB2BValue;

      const evolution = calculateComparison(currentTotal, previousTotal);

      // Get day of week
      const dateObj = new Date(year, month - 1, day);
      const dayName = DAY_NAMES[dateObj.getDay()];

      rows.push({
        period: dayPadded,
        label: `${dayPadded}/${monthPadded} - ${dayName}`,
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
    console.error("Error calculating combined monthly:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate combined monthly",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
