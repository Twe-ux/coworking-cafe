import { Payment, Booking } from '@coworking-cafe/database';
import type Stripe from 'stripe';

/**
 * Handle payment_intent.payment_failed event
 * Updates payment and booking status
 */
export async function handlePaymentFailure(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.log(
      `[PaymentFailure] Payment not found for intent ${paymentIntent.id}`
    );
    return;
  }

  // Update payment status
  payment.status = 'failed';
  payment.failedAt = new Date();
  payment.failureReason =
    paymentIntent.last_payment_error?.message || 'Payment failed';

  await payment.save();

  // Update booking payment status
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = 'failed';
    await booking.save();
    console.log(`[PaymentFailure] Booking ${booking._id} marked as failed`);
  }

  console.log(`[PaymentFailure] Payment ${payment._id} failed:`, payment.failureReason);
}
