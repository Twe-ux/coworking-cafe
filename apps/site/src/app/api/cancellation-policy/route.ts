import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import BookingSettings from "../../../models/bookingSettings";

/**
 * GET /api/cancellation-policy?spaceType=place
 * Get cancellation policy for a specific space type (public endpoint)
 * Query params:
 * - spaceType: "place" (open-space) or "salle-etage" | "salle-verriere" (meeting rooms)
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get space type from query params
    const searchParams = request.nextUrl.searchParams;
    const spaceType = searchParams.get("spaceType");

    // Get settings
    let settings = await BookingSettings.findOne();

    // Determine which policy to use based on space type
    const isMeetingRoom = [
      "meeting-room",
      "meeting-room-glass",
      "meeting-room-floor",
      "salle-verriere",
      "salle-etage",
    ].includes(spaceType || "");

    let policy;
    if (!settings) {
      // Return default policy if none exist
      policy = [
        { daysBeforeBooking: 7, chargePercentage: 0 },
        { daysBeforeBooking: 3, chargePercentage: 50 },
        { daysBeforeBooking: 0, chargePercentage: 100 },
      ];
    } else {
      // Use the appropriate policy based on space type
      if (isMeetingRoom) {
        policy = settings.cancellationPolicyMeetingRooms || [];
      } else {
        // Default to open-space policy for "place" or any other space type
        policy = settings.cancellationPolicyOpenSpace || [];
      }
    }

    // Map to consistent structure
    interface CancellationTier {
      daysBeforeBooking: number;
      chargePercentage: number;
    }

    const tiers = (policy as CancellationTier[]).map((tier) => ({
      daysBeforeBooking: tier.daysBeforeBooking || 0,
      chargePercentage: tier.chargePercentage || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        cancellationPolicy: {
          tiers,
          spaceType: isMeetingRoom ? "meeting_rooms" : "open_space",
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cancellation policy" },
      { status: 500 },
    );
  }
}
