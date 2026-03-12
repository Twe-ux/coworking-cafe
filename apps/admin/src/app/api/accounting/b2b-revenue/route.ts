import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import B2BRevenue from "@/models/accounting/B2BRevenue";
import { Types } from "mongoose";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/accounting/b2b-revenue
 * List B2B revenue entries with optional filters
 *
 * Query params:
 * - startDate: YYYY-MM-DD (filter by service date range)
 * - endDate: YYYY-MM-DD (filter by service date range)
 * - client: string (filter by client name)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const client = searchParams.get("client");

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (startDate && endDate) {
      // Find entries where:
      // 1. serviceDate is within period (standard entries)
      // 2. OR distributionMonth overlaps with period (monthly entries)
      const [startYear, startMonth] = startDate.split('-').map(Number);
      const [endYear, endMonth] = endDate.split('-').map(Number);

      const monthsToCheck = [];
      for (let year = startYear; year <= endYear; year++) {
        const firstMonth = year === startYear ? startMonth : 1;
        const lastMonth = year === endYear ? endMonth : 12;
        for (let month = firstMonth; month <= lastMonth; month++) {
          monthsToCheck.push(`${year}-${String(month).padStart(2, '0')}`);
        }
      }

      query.$or = [
        { serviceDate: { $gte: startDate, $lte: endDate, $ne: '' } },
        { isMonthlyDistribution: true, distributionMonth: { $in: monthsToCheck } },
      ];
    }

    if (client) {
      query.client = { $regex: client, $options: 'i' };
    }

    const entries = await B2BRevenue.find(query)
      .sort({ invoiceDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    console.error("Error fetching B2B revenues:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch B2B revenues",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/b2b-revenue
 * Create new B2B revenue entry
 *
 * Body:
 * - serviceDate: string (YYYY-MM-DD)
 * - invoiceDate: string (YYYY-MM-DD)
 * - client: string
 * - revenueHT_5_5?: number
 * - revenueHT_10?: number
 * - revenueHT_20?: number
 * - revenueHT: number (total)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const body = await request.json();

    // Validate required fields
    const isMonthly = body.isMonthlyDistribution === true;

    // serviceDate optionnel si répartition mensuelle
    if (!isMonthly && !body.serviceDate) {
      return NextResponse.json(
        {
          success: false,
          error: "serviceDate is required for non-monthly invoices",
        },
        { status: 400 }
      );
    }

    if (!body.invoiceDate || !body.client || body.revenueHT === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: invoiceDate, client, revenueHT",
        },
        { status: 400 }
      );
    }

    if (isMonthly && !body.distributionMonth) {
      return NextResponse.json(
        {
          success: false,
          error: "distributionMonth is required for monthly distribution",
        },
        { status: 400 }
      );
    }

    // Create entry
    const entry = new B2BRevenue({
      serviceDate: body.serviceDate || '',
      invoiceDate: body.invoiceDate,
      client: body.client,
      revenueHT_5_5: body.revenueHT_5_5 || 0,
      revenueHT_10: body.revenueHT_10 || 0,
      revenueHT_20: body.revenueHT_20 || 0,
      revenueHT: body.revenueHT,
      isMonthlyDistribution: body.isMonthlyDistribution || false,
      distributionMonth: body.distributionMonth || undefined,
      createdBy: {
        userId: new Types.ObjectId(authResult.session.user.id),
        name: authResult.session.user.name || authResult.session.user.email || "Unknown",
      },
    });

    await entry.save();

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating B2B revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create B2B revenue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
