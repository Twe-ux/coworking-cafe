import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculatePeriodComparison } from "@/lib/accounting/calculate-period-comparison";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";
import type { YearlyComparisonData, ComparisonRow } from "@/types/accounting";

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
 * GET /api/accounting/analytics/yearly
 * Compare revenue by month between current year and previous year
 *
 * Query params:
 * - currentYear: number (default: current year)
 * - previousYear: number (default: currentYear - 1)
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
    const currentYear = parseInt(
      searchParams.get("currentYear") || String(new Date().getFullYear())
    );
    const previousYear = parseInt(
      searchParams.get("previousYear") || String(currentYear - 1)
    );
    const mode = (searchParams.get("mode") as 'ht' | 'ttc') || "ht";

    const rows: ComparisonRow[] = [];

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

      // Calculate revenues and comparison using helper
      const result = await calculatePeriodComparison(
        currentStartDate,
        currentEndDate,
        previousStartDate,
        previousEndDate,
        mode
      );

      rows.push({
        period: MONTH_NAMES[month - 1],
        label: MONTH_NAMES[month - 1],
        date: currentStartDate,
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
    console.error("Error calculating yearly comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate yearly comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
