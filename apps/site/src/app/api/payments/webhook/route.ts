import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import type Stripe from 'stripe';
import { validateWebhookRequest } from './validation';
import { isNewEvent, markEventAsProcessed } from './idempotency';
import {
  handlePaymentAuthorized,
  handleSetupIntentSucceeded,
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentProcessing,
  handlePaymentCanceled,
  handleRefund,
} from './handlers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 *
 * Events handled:
 * - payment_intent.amount_capturable_updated: Authorization hold created (manual capture)
 * - setup_intent.succeeded: Card saved for future payment
 * - payment_intent.succeeded: Payment was successful
 * - payment_intent.payment_failed: Payment failed
 * - charge.refunded: Payment was refunded
 * - payment_intent.processing: Payment is processing
 * - payment_intent.canceled: Payment was canceled
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature and parse event
    const event = await validateWebhookRequest(request);

    // Check idempotency - prevent duplicate processing
    if (!isNewEvent(event.id)) {
      console.log(`[Webhook] Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, cached: true });
    }

    // Connect to database
    await connectDB();

    // Route to appropriate handler
    await routeEvent(event);

    // Mark event as processed
    markEventAsProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook] Handler failed:', errorMessage);

    // Return 400 for validation errors, 500 for others
    const isValidationError = errorMessage.includes('signature');
    const status = isValidationError ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}

/**
 * Route event to appropriate handler based on type
 */
async function routeEvent(event: Stripe.Event): Promise<void> {
  console.log(`[Webhook] Processing event ${event.type} (${event.id})`);

  switch (event.type) {
    case 'payment_intent.amount_capturable_updated': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentAuthorized(paymentIntent);
      break;
    }

    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object as Stripe.SetupIntent;
      await handleSetupIntentSucceeded(setupIntent);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(paymentIntent);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge);
      break;
    }

    case 'payment_intent.processing': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentProcessing(paymentIntent);
      break;
    }

    case 'payment_intent.canceled': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentCanceled(paymentIntent);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
