import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GlobalHoursConfiguration from "@/models/globalHours";
import { requireAuth, handleApiError } from "@/lib/api-helpers";

/**
 * GET /api/admin/global-hours
 * Get global hours configuration (admin endpoint)
 */
export async function GET() {
  try {
    await requireAuth(['admin', 'staff', 'dev']);
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
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/global-hours
 * Update global hours configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(['admin', 'staff', 'dev']);
    await connectDB();

    const body = await request.json();
    const { defaultHours, exceptionalClosures } = body;

    // Get the most recent configuration
    let config = await GlobalHoursConfiguration.findOne().sort({ createdAt: -1 });

    if (!config) {
      // Create new configuration if none exists
      config = await GlobalHoursConfiguration.create({
        defaultHours,
        exceptionalClosures: exceptionalClosures || [],
      });
    } else {
      // Update existing configuration
      if (defaultHours) {
        config.defaultHours = defaultHours;
      }
      if (exceptionalClosures !== undefined) {
        config.exceptionalClosures = exceptionalClosures;
      }
      await config.save();
    }

    return NextResponse.json({
      success: true,
      message: "Global hours configuration updated successfully",
      data: config,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
