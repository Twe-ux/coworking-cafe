import { NextRequest, NextResponse } from "next/server";
import { Event } from "@coworking-cafe/database";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/public
 * Get published upcoming events (public API, no auth required)
 *
 * Query parameters:
 * - limit: Number of events to return (default: 12, max: 50)
 * - category: Filter by category (optional)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const categoryParam = searchParams.get("category");

    // Parse and validate limit
    const limit = Math.min(
      parseInt(limitParam || "12", 10),
      50 // Max 50 events
    );

    // Build query
    const query: any = {
      status: "published",
      date: { $gte: new Date().toISOString().split("T")[0] }, // Only upcoming events
    };

    if (categoryParam) {
      query.category = { $in: [categoryParam] };
    }

    // Fetch events
    const events = await Event.find(query)
      .sort({ date: 1, startTime: 1 }) // Sort by date ascending, then start time
      .limit(limit)
      .select("-createdBy -__v") // Exclude internal fields
      .lean();

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("[API] GET /api/events/public error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}
