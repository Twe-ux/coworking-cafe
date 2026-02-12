import type Stripe from 'stripe';
import { checkExistingBooking, createBookingFromIntent } from '../utils/booking-creator';

/**
 * Handle setup_intent.succeeded event
 * Creates booking when card is saved for later payment (deferred capture)
 */
export async function handleSetupIntentSucceeded(
  setupIntent: Stripe.SetupIntent
): Promise<void> {
  // Check if this setup intent should create a booking
  if (setupIntent.metadata?.createBookingOnAuthorization !== 'true') {
    console.log(
      `[SetupIntentSucceeded] Setup intent ${setupIntent.id} not flagged for booking creation`
    );
    return;
  }

  // Check if booking already exists (idempotency at DB level)
  const exists = await checkExistingBooking({
    metadata: setupIntent.metadata,
    stripeSetupIntentId: setupIntent.id,
    stripeCustomerId: setupIntent.customer as string,
    captureMethod: 'deferred',
  });

  if (exists) {
    console.log(
      `[SetupIntentSucceeded] Booking already exists for setup intent ${setupIntent.id}`
    );
    return;
  }

  // Create booking
  try {
    await createBookingFromIntent({
      metadata: setupIntent.metadata,
      stripeSetupIntentId: setupIntent.id,
      stripeCustomerId: setupIntent.customer as string,
      captureMethod: 'deferred',
    });

    console.log(
      `[SetupIntentSucceeded] Booking created successfully for setup intent ${setupIntent.id}`
    );

    // Note: Initial confirmation email already sent during booking flow
    // We don't resend here to avoid duplicate emails
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE_BOOKING') {
      console.log(
        `[SetupIntentSucceeded] Duplicate booking prevented (race condition) for ${setupIntent.id}`
      );
      return;
    }
    throw error;
  }
}
