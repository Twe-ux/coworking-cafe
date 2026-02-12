import { Payment, Booking } from '@coworking-cafe/database';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';
import type { CardBrand } from '@coworking-cafe/database';

/**
 * Handle payment_intent.succeeded event
 * Updates payment and booking status, extracts card details
 */
export async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.log(
      `[PaymentSuccess] Payment not found for intent ${paymentIntent.id}`
    );
    return;
  }

  // Update payment status
  payment.status = 'succeeded';
  payment.completedAt = new Date();

  // Extract card details from latest charge
  if (paymentIntent.latest_charge) {
    const charge =
      typeof paymentIntent.latest_charge === 'string'
        ? await stripe.charges.retrieve(paymentIntent.latest_charge)
        : paymentIntent.latest_charge;

    payment.stripeChargeId = charge.id;

    if (charge.payment_method_details?.card) {
      const card = charge.payment_method_details.card;
      payment.metadata = {
        ...payment.metadata,
        cardBrand: (card.brand as CardBrand) || undefined,
        cardLast4: card.last4 || undefined,
        cardExpiryMonth: card.exp_month || undefined,
        cardExpiryYear: card.exp_year || undefined,
        receiptUrl: charge.receipt_url || undefined,
      };
    }
  }

  await payment.save();

  // Update booking status
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();
    console.log(`[PaymentSuccess] Booking ${booking._id} confirmed`);
  }

  console.log(`[PaymentSuccess] Payment ${payment._id} succeeded`);
}
