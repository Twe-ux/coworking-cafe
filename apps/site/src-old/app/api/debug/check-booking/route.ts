import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Reservation } from "../../../../models/reservation";

/**
 * DEBUG ENDPOINT - Check if booking exists for payment intent
 *
 * Usage: /api/debug/check-booking?paymentIntentId=pi_xxxxx
 *
 * This endpoint checks if a reservation was created for a given payment intent.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Missing paymentIntentId parameter" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find reservation by payment intent ID
    const reservation = await Reservation.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!reservation) {
      return NextResponse.json({
        success: false,
        found: false,
        message: "No reservation found for this payment intent",
        paymentIntentId,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: {
        id: reservation._id,
        confirmationNumber: reservation.confirmationNumber,
        contactEmail: reservation.contactEmail,
        contactName: reservation.contactName,
        spaceType: reservation.spaceType,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        createdAt: reservation.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check booking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
