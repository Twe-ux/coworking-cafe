import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";

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
 * GET /api/accounting/analytics/breakdown/monthly
 * Get revenue breakdown (B2C + B2B) by day for a given month
 *
 * Query params:
 * - year: number (default: current year)
 * - month: number (1-12, default: current month)
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
      const date = `${year}-${monthPadded}-${dayPadded}`;

      // Calculate B2C and B2B revenues
      const [b2cRevenue, b2bRevenue] = await Promise.all([
        calculateB2CRevenue(date, date),
        calculateB2BRevenue(date, date),
      ]);

      const b2c = mode === 'ht' ? b2cRevenue.ht : b2cRevenue.ttc;
      const b2b = b2bRevenue.ht; // B2B always HT

      // Get day of week
      const dateObj = new Date(year, month - 1, day);
      const dayName = DAY_NAMES[dateObj.getDay()];

      rows.push({
        period: dayPadded,
        label: `${dayPadded}/${monthPadded} - ${dayName}`,
        b2c: Math.round(b2c * 100) / 100,
        b2b: Math.round(b2b * 100) / 100,
        total: Math.round((b2c + b2b) * 100) / 100,
      });
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error calculating monthly breakdown:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate monthly breakdown",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
