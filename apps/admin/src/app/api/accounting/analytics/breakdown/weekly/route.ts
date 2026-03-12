import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";

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
 * GET /api/accounting/analytics/breakdown/weekly
 * Get revenue breakdown (B2C + B2B) by week for a given year
 *
 * Query params:
 * - year: number (default: current year)
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
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    );
    const mode = (searchParams.get("mode") as 'ht' | 'ttc') || "ht";

    const rows = [];

    // Get number of weeks in year (52 or 53)
    const lastDayOfYear = new Date(year, 11, 31);
    const weeksInYear = getISOWeek(lastDayOfYear);

    // Calculate revenue for each week
    for (let week = 1; week <= weeksInYear; week++) {
      const bounds = getWeekBounds(year, week);

      // Calculate B2C and B2B revenues
      const [b2cRevenue, b2bRevenue] = await Promise.all([
        calculateB2CRevenue(bounds.startDate, bounds.endDate),
        calculateB2BRevenue(bounds.startDate, bounds.endDate),
      ]);

      const b2c = mode === 'ht' ? b2cRevenue.ht : b2cRevenue.ttc;
      const b2b = b2bRevenue.ht; // B2B always HT

      // Format dates for label (dd/mm - dd/mm)
      const startParts = bounds.startDate.split("-");
      const endParts = bounds.endDate.split("-");
      const datesLabel = `${startParts[2]}/${startParts[1]} - ${endParts[2]}/${endParts[1]}`;

      rows.push({
        period: `S${week}`,
        label: `Semaine ${week} (${datesLabel})`,
        b2c: Math.round(b2c * 100) / 100,
        b2b: Math.round(b2b * 100) / 100,
        total: Math.round((b2c + b2b) * 100) / 100,
      });
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error calculating weekly breakdown:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate weekly breakdown",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
