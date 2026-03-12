import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";

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
 * GET /api/accounting/analytics/breakdown/yearly
 * Get revenue breakdown (B2C + B2B) by month for a given year
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

    // Calculate revenue for each month
    for (let month = 1; month <= 12; month++) {
      const monthPadded = String(month).padStart(2, "0");

      const startDate = `${year}-${monthPadded}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, "0")}`;

      // Calculate B2C and B2B revenues
      const [b2cRevenue, b2bRevenue] = await Promise.all([
        calculateB2CRevenue(startDate, endDate),
        calculateB2BRevenue(startDate, endDate),
      ]);

      const b2c = mode === 'ht' ? b2cRevenue.ht : b2cRevenue.ttc;
      const b2b = b2bRevenue.ht; // B2B always HT

      rows.push({
        period: MONTH_NAMES[month - 1],
        label: MONTH_NAMES[month - 1],
        b2c: Math.round(b2c * 100) / 100,
        b2b: Math.round(b2b * 100) / 100,
        total: Math.round((b2c + b2b) * 100) / 100,
      });
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error calculating yearly breakdown:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate yearly breakdown",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
