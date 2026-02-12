import { Payment, Booking } from '@coworking-cafe/database';
import type Stripe from 'stripe';

/**
 * Handle charge.refunded event
 * Updates payment and booking to refunded status
 */
export async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const payment = await Payment.findOne({
    stripeChargeId: charge.id,
  });

  if (!payment) {
    console.log(`[Refund] Payment not found for charge ${charge.id}`);
    return;
  }

  // Get refund details
  const refund = charge.refunds?.data[0];

  if (!refund) {
    console.warn(`[Refund] No refund data found for charge ${charge.id}`);
    return;
  }

  // Update payment with refund info
  payment.status = 'refunded';
  payment.stripeRefundId = refund.id;
  payment.metadata = {
    ...payment.metadata,
    refundedAmount: refund.amount,
    refundedAt: new Date(),
    refundReason: refund.reason || 'Refund processed',
  };

  await payment.save();

  // Update booking status
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = 'refunded';
    await booking.save();
    console.log(`[Refund] Booking ${booking._id} marked as refunded`);
  }

  console.log(
    `[Refund] Payment ${payment._id} refunded (${refund.amount / 100}€)`
  );
}
