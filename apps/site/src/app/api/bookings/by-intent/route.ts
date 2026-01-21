import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';

/**
 * GET /api/bookings/by-intent
 * Find a booking by Stripe payment intent or setup intent ID
 * Query params: intentId, intentType (payment | setup)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const intentId = searchParams.get("intentId");
    const intentType = searchParams.get("intentType"); // 'payment' or 'setup'

    if (!intentId || !intentType) {
      return NextResponse.json(
        { error: "intentId and intentType are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Search for booking by payment intent or setup intent
    const query =
      intentType === "payment"
        ? { stripePaymentIntentId: intentId }
        : { stripeSetupIntentId: intentId };

    const booking = await Reservation.findOne(query);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found yet" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to find booking" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
