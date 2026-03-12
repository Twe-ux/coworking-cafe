import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculatePeriodComparison } from "@/lib/accounting/calculate-period-comparison";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";
import type { YearlyComparisonData, ComparisonRow } from "@/types/accounting";

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
 * GET /api/accounting/analytics/monthly
 * Compare revenue by day for a given month between current year and previous year
 *
 * Query params:
 * - year: number (default: current year)
 * - month: number (1-12, default: current month)
 * - previousYear: number (default: year - 1)
 * - mode: "summary" | "detailed" (default: detailed)
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

    const rows: ComparisonRow[] = [];

    // Get number of days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPadded = String(month).padStart(2, "0");

    // Calculate revenue for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPadded = String(day).padStart(2, "0");

      // Current year date
      const currentDate = `${year}-${monthPadded}-${dayPadded}`;

      // Previous year date (same month/day)
      const previousDate = `${previousYear}-${monthPadded}-${dayPadded}`;

      // Calculate revenues and comparison using helper
      const result = await calculatePeriodComparison(
        currentDate,
        currentDate,
        previousDate,
        previousDate,
        mode
      );

      // Get day of week
      const dateObj = new Date(year, month - 1, day);
      const dayName = DAY_NAMES[dateObj.getDay()];

      rows.push({
        period: dayPadded,
        label: `${dayPadded}/${monthPadded} - ${dayName}`,
        date: currentDate,
        current: result.current,
        previous: result.previous,
        evolution: result.evolution,
      });
    }

    // Calculate summary
    const totalCurrent = rows.reduce((sum, row) => sum + row.current, 0);
    const totalPrevious = rows.reduce((sum, row) => sum + row.previous, 0);
    const totalEvolution = calculateComparison(totalCurrent, totalPrevious);

    const average = totalCurrent / rows.length;

    const best = rows.reduce((bestRow, currentRow) =>
      currentRow.current > bestRow.current ? currentRow : bestRow
    );

    const worst = rows.reduce((worstRow, currentRow) =>
      currentRow.current < worstRow.current ? currentRow : worstRow
    );

    const data: YearlyComparisonData = {
      rows,
      summary: {
        total: {
          period: "Total",
          current: Math.round(totalCurrent * 100) / 100,
          previous: Math.round(totalPrevious * 100) / 100,
          evolution: totalEvolution,
        },
        average: Math.round(average * 100) / 100,
        best,
        worst,
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error calculating monthly comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate monthly comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
