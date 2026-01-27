import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@coworking-cafe/database";

/**
 * GET /api/booking/pending-count
 * Returns count of pending bookings
 */
export async function GET() {
  try {
    await connectDB();

    const count = await Booking.countDocuments({ status: "pending" });

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("GET /api/booking/pending-count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending count" },
      { status: 500 }
    );
  }
}
