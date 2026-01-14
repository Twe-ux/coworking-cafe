import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GlobalHoursConfiguration from "@/models/globalHours";
import { requireAuth, handleApiError } from "@/lib/api-helpers";

const defaultHours = {
  monday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  tuesday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  wednesday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  thursday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  friday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  saturday: { isOpen: true, openTime: "10:00", closeTime: "20:00" },
  sunday: { isOpen: true, openTime: "10:00", closeTime: "20:00" },
};

/**
 * POST /api/admin/global-hours/seed
 * Initialize default global hours configuration
 */
export async function POST() {
  try {
    await requireAuth(['admin', 'dev']);
    await connectDB();

    // Check if configuration already exists
    const existingCount = await GlobalHoursConfiguration.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        {
          error: "Global hours configuration already exists. Use PATCH to update instead.",
        },
        { status: 400 }
      );
    }

    // Create default configuration
    const config = await GlobalHoursConfiguration.create({
      defaultHours,
      exceptionalClosures: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Global hours configuration initialized successfully",
        data: config,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
