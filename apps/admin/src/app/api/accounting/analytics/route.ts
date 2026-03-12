import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { calculateB2CRevenue } from "@/lib/accounting/calculate-b2c-revenue";
import { calculateB2BRevenue } from "@/lib/accounting/calculate-b2b-revenue";
import {
  calculateComparison,
  getPreviousPeriod,
  getYearAgoPeriod,
} from "@/lib/accounting/calculate-comparison";
import type { AnalyticsResponse, ChartDataPoint } from "@/types/accounting";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/accounting/analytics
 * Calculate revenue analytics for a period with optional comparison
 *
 * Query params:
 * - period: "month" | "week" | "custom" (default: month)
 * - startDate: YYYY-MM-DD (required for custom)
 * - endDate: YYYY-MM-DD (required for custom)
 * - compareWith: "previous" | "year-ago" (optional)
 * - mode: "detailed" | "summary" (default: detailed)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const compareWith = searchParams.get("compareWith");
    const mode = searchParams.get("mode") || "detailed";

    // Determine current period dates
    let startDate: string;
    let endDate: string;
    let periodLabel: string;

    if (period === "custom") {
      const customStart = searchParams.get("startDate");
      const customEnd = searchParams.get("endDate");

      if (!customStart || !customEnd) {
        return NextResponse.json(
          { success: false, error: "startDate and endDate required for custom period" },
          { status: 400 }
        );
      }

      startDate = customStart;
      endDate = customEnd;
      periodLabel = `${startDate} à ${endDate}`;
    } else if (period === "month") {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      periodLabel = `${getMonthName(month)} ${year}`;
    } else {
      // week
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      startDate = formatDate(monday);
      endDate = formatDate(sunday);
      periodLabel = `Semaine du ${startDate}`;
    }

    // Calculate current period revenue
    const [b2cCurrent, b2bCurrent] = await Promise.all([
      calculateB2CRevenue(startDate, endDate),
      calculateB2BRevenue(startDate, endDate),
    ]);

    const totalCurrent = {
      ht: b2cCurrent.ht + b2bCurrent.ht,
      ttc: b2cCurrent.ttc,
      tva: b2cCurrent.tva,
    };

    // Chart data with current period (TODO: implement historical data)
    const chartData: ChartDataPoint[] = [
      {
        displayDate: periodLabel,
        current: {
          ht: totalCurrent.ht,
          ttc: totalCurrent.ttc,
        },
      },
    ];

    const response: AnalyticsResponse = {
      current: {
        b2c: b2cCurrent,
        b2b: b2bCurrent,
        total: totalCurrent,
      },
      breakdown: {
        bookings: 0, // TODO: Calculate from Turnover bookings
        products: 0, // TODO: Calculate from Turnover products
        services: 0, // TODO: Calculate from Turnover services
        b2b: b2bCurrent.ht,
      },
      chartData,
    };

    // Add comparison if requested
    if (compareWith) {
      let comparisonStart: string;
      let comparisonEnd: string;
      let comparisonLabel: string;

      if (compareWith === "previous") {
        const previousPeriod = getPreviousPeriod(new Date(startDate), period as "month" | "week");
        comparisonStart = previousPeriod.startDate;
        comparisonEnd = previousPeriod.endDate;
        comparisonLabel = `Période précédente`;
      } else {
        const yearAgoPeriod = getYearAgoPeriod(startDate, endDate);
        comparisonStart = yearAgoPeriod.startDate;
        comparisonEnd = yearAgoPeriod.endDate;
        comparisonLabel = `Il y a 1 an`;
      }

      const [b2cPrevious, b2bPrevious] = await Promise.all([
        calculateB2CRevenue(comparisonStart, comparisonEnd),
        calculateB2BRevenue(comparisonStart, comparisonEnd),
      ]);

      const totalPrevious = {
        ht: b2cPrevious.ht + b2bPrevious.ht,
        ttc: b2cPrevious.ttc,
        tva: b2cPrevious.tva,
      };

      // Add comparison data to chart
      chartData[0].comparison = {
        ht: totalPrevious.ht,
        ttc: totalPrevious.ttc,
      };

      response.comparison = {
        b2c: b2cPrevious,
        b2b: b2bPrevious,
        total: totalPrevious,
      };
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthName(month: number): string {
  const months = [
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
  return months[month];
}
