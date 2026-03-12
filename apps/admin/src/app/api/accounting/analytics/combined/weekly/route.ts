import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";
import { calculateComparison } from "@/lib/accounting/calculate-comparison";

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
 * GET /api/accounting/analytics/combined/weekly
 * Get combined breakdown + comparison by week
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

    // Get number of weeks in current year (52 or 53)
    const lastDayOfYear = new Date(currentYear, 11, 31);
    const weeksInYear = getISOWeek(lastDayOfYear);

    // Calculate revenue for each week
    for (let week = 1; week <= weeksInYear; week++) {
      const currentBounds = getWeekBounds(currentYear, week);
      const previousBounds = getWeekBounds(previousYear, week);

      // Calculate revenues
      const [currentB2C, currentB2B, previousB2C, previousB2B] = await Promise.all([
        calculateB2CRevenue(currentBounds.startDate, currentBounds.endDate),
        calculateB2BRevenue(currentBounds.startDate, currentBounds.endDate),
        calculateB2CRevenue(previousBounds.startDate, previousBounds.endDate),
        calculateB2BRevenue(previousBounds.startDate, previousBounds.endDate),
      ]);

      const currentB2CValue = mode === 'ht' ? currentB2C.ht : currentB2C.ttc;
      const currentB2BValue = mode === 'ht' ? currentB2B.ht : currentB2B.ttc;
      const currentTotal = currentB2CValue + currentB2BValue;

      const previousB2CValue = mode === 'ht' ? previousB2C.ht : previousB2C.ttc;
      const previousB2BValue = mode === 'ht' ? previousB2B.ht : previousB2B.ttc;
      const previousTotal = previousB2CValue + previousB2BValue;

      const evolution = calculateComparison(currentTotal, previousTotal);

      // Format dates for label (dd/mm - dd/mm)
      const startParts = currentBounds.startDate.split("-");
      const endParts = currentBounds.endDate.split("-");
      const datesLabel = `${startParts[2]}/${startParts[1]} - ${endParts[2]}/${endParts[1]}`;

      rows.push({
        period: `S${week}`,
        label: `Semaine ${week} (${datesLabel})`,
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
    console.error("Error calculating combined weekly:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate combined weekly",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
