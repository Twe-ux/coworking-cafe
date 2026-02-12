import type Stripe from 'stripe';
import { checkExistingBooking, createBookingFromIntent } from '../utils/booking-creator';
import { sendBookingConfirmationEmail, sendAdminNotification } from '../utils/email-sender';
import { parseAdditionalServices } from '../utils/metadata-parser';

interface AdditionalService {
  name?: string;
  serviceName?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
}

/**
 * Handle payment_intent.amount_capturable_updated event
 * Creates booking when payment is authorized (manual capture)
 */
export async function handlePaymentAuthorized(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // Check if this payment should create a booking
  if (paymentIntent.metadata?.createBookingOnAuthorization !== 'true') {
    console.log(
      `[PaymentAuthorized] Payment intent ${paymentIntent.id} not flagged for booking creation`
    );
    return;
  }

  const metadata = paymentIntent.metadata;

  // Calculate deposit amount
  const depositAmountInCents = metadata.depositAmount
    ? parseInt(metadata.depositAmount)
    : Math.round(parseFloat(metadata.totalPrice) * 100);

  // Check if booking already exists (idempotency at DB level)
  const exists = await checkExistingBooking({
    metadata,
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: paymentIntent.customer as string,
    captureMethod: 'manual',
    depositAmount: depositAmountInCents,
  });

  if (exists) {
    console.log(
      `[PaymentAuthorized] Booking already exists for payment intent ${paymentIntent.id}`
    );
    return;
  }

  // Create booking
  let booking;
  try {
    booking = await createBookingFromIntent({
      metadata,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string,
      captureMethod: 'manual',
      depositAmount: depositAmountInCents,
    });

    console.log(
      `[PaymentAuthorized] Booking ${booking._id} created for payment intent ${paymentIntent.id}`
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE_BOOKING') {
      console.log(
        `[PaymentAuthorized] Duplicate booking prevented (race condition) for ${paymentIntent.id}`
      );
      return;
    }
    throw error;
  }

  // Parse additional services for email
  const additionalServices = parseAdditionalServices(metadata.additionalServices);
  const emailServices = additionalServices.map((service: AdditionalService) => ({
    name: service.name || service.serviceName || 'Service',
    quantity: service.quantity || 1,
    price: service.unitPrice || service.price || 0,
  }));

  // Send confirmation email (non-blocking)
  await sendBookingConfirmationEmail({
    contactEmail: metadata.contactEmail,
    contactName: metadata.contactName,
    spaceType: metadata.spaceType,
    date: new Date(metadata.date),
    startTime: metadata.startTime,
    endTime: metadata.endTime,
    totalPrice: parseFloat(metadata.totalPrice),
    bookingId: booking._id.toString(),
    depositAmount: depositAmountInCents,
    captureMethod: (metadata.captureMethod || 'manual') as 'manual' | 'automatic',
    additionalServices: emailServices.length > 0 ? emailServices : undefined,
    numberOfPeople: parseInt(metadata.numberOfPeople),
  });

  // Send admin notification (non-blocking)
  await sendAdminNotification(booking._id.toString());
}
