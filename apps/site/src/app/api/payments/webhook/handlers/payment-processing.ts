import { Payment } from '@coworking-cafe/database';
import type Stripe from 'stripe';

/**
 * Handle payment_intent.processing event
 * Updates payment status to "processing"
 */
export async function handlePaymentProcessing(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.log(
      `[PaymentProcessing] Payment not found for intent ${paymentIntent.id}`
    );
    return;
  }

  payment.status = 'processing';
  await payment.save();

  console.log(`[PaymentProcessing] Payment ${payment._id} marked as processing`);
}
