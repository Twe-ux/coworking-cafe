import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculatePeriodComparison } from "@/lib/accounting/calculate-period-comparison";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";
import type { YearlyComparisonData, ComparisonRow } from "@/types/accounting";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get ISO week number
 */
function getISOWeek(date: Date): number {
  const tempDate = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000);
}

/**
 * Get start and end date of ISO week
 */
function getWeekBounds(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

  return {
    startDate: formatDate(ISOweekStart),
    endDate: formatDate(ISOweekEnd),
  };
}

/**
 * GET /api/accounting/analytics/weekly
 * Compare revenue by week (ISO week) between current year and previous year
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

    // Get number of weeks in current year (52 or 53)
    const lastDayOfYear = new Date(currentYear, 11, 31);
    const weeksInYear = getISOWeek(lastDayOfYear);

    // Calculate revenue for each week
    for (let week = 1; week <= weeksInYear; week++) {
      const currentBounds = getWeekBounds(currentYear, week);
      const previousBounds = getWeekBounds(previousYear, week);

      // Calculate revenues and comparison using helper
      const result = await calculatePeriodComparison(
        currentBounds.startDate,
        currentBounds.endDate,
        previousBounds.startDate,
        previousBounds.endDate,
        mode
      );

      // Format dates for label (dd/mm - dd/mm)
      const startParts = currentBounds.startDate.split("-");
      const endParts = currentBounds.endDate.split("-");
      const datesLabel = `${startParts[2]}/${startParts[1]} - ${endParts[2]}/${endParts[1]}`;

      rows.push({
        period: `S${week}`,
        label: `Semaine ${week} (${datesLabel})`,
        date: currentBounds.startDate,
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
    console.error("Error calculating weekly comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate weekly comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
