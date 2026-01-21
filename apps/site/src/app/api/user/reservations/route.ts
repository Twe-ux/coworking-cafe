import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../../lib/db";
import { Reservation } from "../../../../models/reservation";

/**
 * GET /api/user/reservations
 * Get current user's reservations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // upcoming, past, cancelled
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: Record<string, unknown> = {
      user: session.user.id,
      isDeleted: false,
    };

    const now = new Date();

    if (status === "upcoming") {
      query.startDate = { $gte: now };
      query.status = { $in: ["pending", "confirmed"] };
    } else if (status === "past") {
      query.endDate = { $lt: now };
    } else if (status === "cancelled") {
      query.status = "cancelled";
    }

    const reservations = await Reservation.find(query)
      .populate("space", "name slug spaceType")
      .sort({ startDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Reservation.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 },
    );
  }
}
