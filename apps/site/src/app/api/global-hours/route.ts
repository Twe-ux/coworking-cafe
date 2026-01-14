import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GlobalHoursConfiguration from "@/models/globalHours";

/**
 * GET /api/global-hours
 * Get global hours configuration (public endpoint)
 */
export async function GET() {
  try {
    await connectDB();

    // Get the most recent global hours configuration
    const config = await GlobalHoursConfiguration.findOne().sort({ createdAt: -1 });

    if (!config) {
      return NextResponse.json(
        { error: "No global hours configuration found. Please initialize." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {    return NextResponse.json(
      { error: "Failed to fetch global hours configuration" },
      { status: 500 }
    );
  }
}
