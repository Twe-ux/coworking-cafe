import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import { Reservation } from '@/models/reservation';
import { requireAuth, handleApiError } from '@/lib/api-helpers';
import { createRefund } from '@/lib/stripe';
import mongoose from 'mongoose';
import Stripe from 'stripe';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/[id]/refund
 * Create a refund for a payment (admin only)
 *
 * Body parameters:
 * - amount (optional): Partial refund amount in cents. If not provided, full refund is issued
 * - reason (optional): Reason for refund (requested_by_customer, duplicate, fraudulent)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication and admin role
    const user = await requireAuth();
    if (!user || !['admin', 'dev'].includes(user.role?.slug || '')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    // Get payment
    const payment = await Payment.findById(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment can be refunded
    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Only successful payments can be refunded' },
        { status: 400 }
      );
    }

    if (payment.stripeRefundId) {
      return NextResponse.json(
        { success: false, error: 'Payment has already been refunded' },
        { status: 400 }
      );
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'No Stripe payment intent ID found' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { amount, reason } = body;

    // Validate amount if provided (must be positive and not exceed original amount)
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Refund amount must be positive' },
          { status: 400 }
        );
      }

      if (amount > payment.amount) {
        return NextResponse.json(
          { success: false, error: 'Refund amount cannot exceed original payment amount' },
          { status: 400 }
        );
      }
    }

    // Validate reason if provided
    const validReasons: Stripe.RefundCreateParams.Reason[] = [
      'requested_by_customer',
      'duplicate',
      'fraudulent',
    ];

    if (reason && !validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid reason. Must be one of: ${validReasons.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refund = await createRefund(
      payment.stripePaymentIntentId,
      amount, // undefined = full refund
      reason
    );

    // Update payment record
    payment.status = 'refunded';
    payment.stripeRefundId = refund.id;
    payment.metadata = {
      ...payment.metadata,
      refundedAmount: refund.amount,
      refundedAt: new Date(),
      refundReason: refund.reason || 'Admin initiated refund',
    };

    await payment.save();

    // Update booking status
    const booking = await Reservation.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'refunded';
      // Optionally cancel the booking
      if (booking.status !== 'completed' && booking.status !== 'cancelled') {
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
      }
      await booking.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      },
      message: amount ? 'Partial refund processed successfully' : 'Full refund processed successfully',
    });
  } catch (error) {
    // Check if error is due to missing Stripe configuration
    if (error instanceof Error && error.message.includes('STRIPE')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not configured properly',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return handleApiError(error);
  }
}
