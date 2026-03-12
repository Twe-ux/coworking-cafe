import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import B2BRevenue from "@/models/accounting/B2BRevenue";
import { Types } from "mongoose";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/accounting/b2b-revenue/[id]
 * Fetch specific B2B revenue entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const entry = await B2BRevenue.findById(id).lean();

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "B2B revenue entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error fetching B2B revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch B2B revenue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounting/b2b-revenue/[id]
 * Update B2B revenue entry
 *
 * Body: Same as POST (serviceDate, invoiceDate, client, revenueHT_*)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find existing entry
    const entry = await B2BRevenue.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "B2B revenue entry not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (body.serviceDate !== undefined) {
      entry.serviceDate = body.serviceDate;
    }

    if (body.invoiceDate !== undefined) {
      entry.invoiceDate = body.invoiceDate;
    }

    if (body.client !== undefined) {
      entry.client = body.client;
    }

    if (body.revenueHT_5_5 !== undefined) {
      entry.revenueHT_5_5 = body.revenueHT_5_5;
    }

    if (body.revenueHT_10 !== undefined) {
      entry.revenueHT_10 = body.revenueHT_10;
    }

    if (body.revenueHT_20 !== undefined) {
      entry.revenueHT_20 = body.revenueHT_20;
    }

    if (body.revenueHT !== undefined) {
      entry.revenueHT = body.revenueHT;
    }

    if (body.isMonthlyDistribution !== undefined) {
      entry.isMonthlyDistribution = body.isMonthlyDistribution;
    }

    if (body.distributionMonth !== undefined) {
      entry.distributionMonth = body.distributionMonth;
    }

    await entry.save();

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error updating B2B revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update B2B revenue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/b2b-revenue/[id]
 * Delete B2B revenue entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const entry = await B2BRevenue.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "B2B revenue entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "B2B revenue entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting B2B revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete B2B revenue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
