import { Payment } from '@coworking-cafe/database';
import type Stripe from 'stripe';

/**
 * Handle payment_intent.canceled event
 * Updates payment status to "cancelled"
 */
export async function handlePaymentCanceled(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.log(
      `[PaymentCanceled] Payment not found for intent ${paymentIntent.id}`
    );
    return;
  }

  payment.status = 'cancelled';
  await payment.save();

  console.log(`[PaymentCanceled] Payment ${payment._id} marked as cancelled`);
}
