import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Reservation } from '@/models/reservation';
import Payment from '@/models/payment';
import { requireAuth, handleApiError } from '@/lib/api-helpers';
import { cancelPaymentIntent } from '@/lib/stripe';
import mongoose from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/cancel-intent
 * Cancel a Stripe Payment Intent (release hold when customer shows up)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(['admin']);
    const body = await request.json();

    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await Reservation.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'No payment intent found for this booking' },
        { status: 400 }
      );
    }

    // Cancel the payment intent
    const cancelledIntent = await cancelPaymentIntent(booking.stripePaymentIntentId);

    // Update payment record
    await Payment.updateOne(
      { stripePaymentIntentId: booking.stripePaymentIntentId },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
      }
    );

    // Update booking
    booking.paymentStatus = 'refunded'; // Client showed up, hold released
    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: cancelledIntent.id,
        status: cancelledIntent.status,
      },
      message: 'Payment intent cancelled successfully (hold released)',
    });
  } catch (error) {    return handleApiError(error);
  }
}
