import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Reservation } from "../../../../models/reservation";
import Payment from "../../../../models/payment";
import { requireAuth, handleApiError } from "../../../../lib/api-helpers";
import { capturePaymentIntent } from "../../../../lib/stripe";
import mongoose from "mongoose";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/capture-intent
 * Capture a Stripe Payment Intent (charge for no-show)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(["admin"]);
    const body = await request.json();

    const { bookingId, amount } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 },
      );
    }

    // Get booking
    const booking = await Reservation.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { success: false, error: "No payment intent found for this booking" },
        { status: 400 },
      );
    }

    // Capture the payment intent
    const capturedIntent = await capturePaymentIntent(
      booking.stripePaymentIntentId,
      amount, // Optional: capture partial amount
    );

    // Update payment record
    await Payment.updateOne(
      { stripePaymentIntentId: booking.stripePaymentIntentId },
      {
        status: "succeeded",
        capturedAt: new Date(),
        amount: capturedIntent.amount_received || capturedIntent.amount,
      },
    );

    // Update booking
    booking.paymentStatus = "paid";
    booking.amountPaid =
      capturedIntent.amount_received || capturedIntent.amount;
    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: capturedIntent.id,
        status: capturedIntent.status,
        amountCaptured: capturedIntent.amount_received || capturedIntent.amount,
      },
      message: "Payment intent captured successfully (no-show charged)",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
