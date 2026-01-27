import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Payment, Booking, SpaceConfiguration } from "@coworking-cafe/database";
import { verifyWebhookSignature, stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import type { CardBrand } from '@coworking-cafe/database';
import { sendBookingConfirmation, sendCardSavedConfirmation } from '@/lib/email/emailService';
import { getSpaceTypeName } from '@/lib/space-names';

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
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {      return NextResponse.json(
        { error: 'No stripe signature found' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.amount_capturable_updated': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // NEW WORKFLOW: Create booking if payment is authorized and metadata flag is set
        await handlePaymentAuthorized(paymentIntent);
        break;
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        // NEW WORKFLOW: Create booking if card is saved and metadata flag is set
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

      default:    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find payment by Stripe payment intent ID
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {      return;
    }

    // Update payment status
    payment.status = 'succeeded';
    payment.completedAt = new Date();

    // Extract card details from latest charge if available
    if (paymentIntent.latest_charge) {
      const charge = typeof paymentIntent.latest_charge === 'string'
        ? await stripe.charges.retrieve(paymentIntent.latest_charge)
        : paymentIntent.latest_charge;

      payment.stripeChargeId = charge.id;

      if (charge.payment_method_details?.card) {
        const card = charge.payment_method_details.card;
        payment.metadata = {
          ...payment.metadata,
          cardBrand: card.brand as CardBrand | undefined,
          cardLast4: card.last4 ?? undefined,
          cardExpiryMonth: card.exp_month ?? undefined,
          cardExpiryYear: card.exp_year ?? undefined,
          receiptUrl: charge.receipt_url ? charge.receipt_url : undefined,
        };
      }
    }

    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();    }
  } catch (error) {    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {      return;
    }

    // Update payment status
    payment.status = 'failed';
    payment.failedAt = new Date();
    payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

    await payment.save();

    // Update booking payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();
    }
  } catch (error) {    throw error;
  }
}

/**
 * Handle payment processing status
 */
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      return;
    }

    payment.status = 'processing';
    await payment.save();
  } catch (error) {    throw error;
  }
}

/**
 * Handle payment canceled
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      return;
    }

    payment.status = 'cancelled';
    await payment.save();
  } catch (error) {    throw error;
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  try {
    const payment = await Payment.findOne({
      stripeChargeId: charge.id,
    });

    if (!payment) {      return;
    }

    // Get refund details
    const refund = charge.refunds?.data[0];

    if (refund) {
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
        await booking.save();      }
    }
  } catch (error) {    throw error;
  }
}

/**
 * NEW WORKFLOW: Handle payment authorized (manual capture)
 * Creates reservation from payment intent metadata
 */
async function handlePaymentAuthorized(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Check if this payment should create a booking
    if (paymentIntent.metadata?.createBookingOnAuthorization !== 'true') {      return;
    }

    // CRITICAL: Check if booking already exists BEFORE creating (prevents race condition duplicates)
    // This check must happen synchronously before any async operations
    const existingBooking = await Booking.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (existingBooking) {      // Send email again if needed (in case first one failed)
      return;
    }

    // Parse reservation data from metadata
    const metadata = paymentIntent.metadata;

    // Generate confirmation number
    const confirmationNumber = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Parse additional services if present
    let additionalServices = [];
    if (metadata.additionalServices) {
      try {
        additionalServices = JSON.parse(metadata.additionalServices);
      } catch (error) {
    }
    }

    // Parse invoiceDetails if present
    let invoiceDetails = undefined;
    if (metadata.invoiceDetails) {
      try {
        invoiceDetails = JSON.parse(metadata.invoiceDetails);
      } catch (error) {
    }
    }

    // Calculate deposit amount from metadata
    const depositAmountInCents = metadata.depositAmount
      ? parseInt(metadata.depositAmount)
      : Math.round(parseFloat(metadata.totalPrice) * 100);

    // Create reservation
    let reservation;
    try {
      reservation = await Booking.create({
        spaceType: metadata.spaceType,
        date: new Date(metadata.date),
        startTime: metadata.startTime,
        endTime: metadata.endTime,
        numberOfPeople: parseInt(metadata.numberOfPeople),
        totalPrice: parseFloat(metadata.totalPrice),
        user: metadata.userId || null,
        contactEmail: metadata.contactEmail,
        contactName: metadata.contactName,
        contactPhone: metadata.contactPhone,
        companyName: metadata.companyName || '',
        status: 'pending', // Will be confirmed by admin
        paymentStatus: 'pending',
        invoiceOption: metadata.invoiceOption !== 'no_invoice', // Convert to boolean
        invoiceDetails: invoiceDetails,
        additionalServices,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        captureMethod: 'manual',
        depositAmount: depositAmountInCents, // Store deposit amount in cents
        requiresPayment: true,
        confirmationNumber,
        isPartialPrivatization: metadata.isPartialPrivatization === 'true',
        message: metadata.message || '',
      });    } catch (createError: any) {
      // Handle duplicate key error (E11000) - happens when webhook is called multiple times
      if (createError.code === 11000 && createError.keyPattern?.stripePaymentIntentId) {        return;
      }
      // Re-throw other errors
      throw createError;
    }

    // Send confirmation email to customer
    try {
      const spaceConfig = await SpaceConfiguration.findOne({ spaceType: metadata.spaceType });

      await sendBookingConfirmation(metadata.contactEmail, {
        name: metadata.contactName,
        spaceName: spaceConfig?.name || getSpaceTypeName(metadata.spaceType),
        date: new Date(metadata.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: metadata.startTime && metadata.endTime
          ? `${metadata.startTime} - ${metadata.endTime}`
          : 'Journée complète',
        price: parseFloat(metadata.totalPrice),
        bookingId: (reservation._id as any).toString(),
        requiresPayment: true,
        depositAmount: depositAmountInCents, // Use stored deposit amount in cents
        captureMethod: metadata.captureMethod as 'manual' | 'automatic',
        numberOfPeople: parseInt(metadata.numberOfPeople),
      });
    } catch (emailError) {
      // Don't fail the booking creation if email fails
    }

    // Send push notification to admin
    try {
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
      const notificationsSecret = process.env.NOTIFICATIONS_SECRET;

      console.log('[Webhook] Attempting to send admin notification...', {
        adminUrl,
        hasSecret: !!notificationsSecret,
        bookingId: (reservation._id as any).toString(),
      });

      if (notificationsSecret) {
        const notifResponse = await fetch(`${adminUrl}/api/notifications/booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${notificationsSecret}`,
          },
          body: JSON.stringify({
            bookingId: (reservation._id as any).toString(),
          }),
        });

        const notifResult = await notifResponse.json().catch(() => ({}));
        console.log('[Webhook] Admin notification response:', {
          status: notifResponse.status,
          ok: notifResponse.ok,
          result: notifResult,
        });

        if (notifResponse.ok) {
          console.log('[Webhook] Admin notification sent for new booking');
        } else {
          console.error('[Webhook] Admin notification failed:', notifResult);
        }
      } else {
        console.warn('[Webhook] NOTIFICATIONS_SECRET not configured, skipping notification');
      }
    } catch (notifError) {
      // Don't fail the booking creation if notification fails
      console.error('[Webhook] Failed to send admin notification:', notifError);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * NEW WORKFLOW: Handle setup intent succeeded (card saved for later)
 * Creates reservation from setup intent metadata
 */
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    // Check if this setup intent should create a booking
    if (setupIntent.metadata?.createBookingOnAuthorization !== 'true') {      return;
    }

    // Check if booking already exists for this setup intent
    const existingBooking = await Booking.findOne({
      stripeSetupIntentId: setupIntent.id,
    });

    if (existingBooking) {      return;
    }

    // Parse reservation data from metadata
    const metadata = setupIntent.metadata;

    // Generate confirmation number
    const confirmationNumber = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Parse additional services if present
    let additionalServices = [];
    if (metadata.additionalServices) {
      try {
        additionalServices = JSON.parse(metadata.additionalServices);
      } catch (error) {
    }
    }

    // Parse invoiceDetails if present
    let invoiceDetails = undefined;
    if (metadata.invoiceDetails) {
      try {
        invoiceDetails = JSON.parse(metadata.invoiceDetails);
      } catch (error) {
    }
    }

    // Create reservation
    const reservation = await Booking.create({
      spaceType: metadata.spaceType,
      date: new Date(metadata.date),
      startTime: metadata.startTime,
      endTime: metadata.endTime,
      numberOfPeople: parseInt(metadata.numberOfPeople),
      totalPrice: parseFloat(metadata.totalPrice),
      user: metadata.userId || null,
      contactEmail: metadata.contactEmail,
      contactName: metadata.contactName,
      contactPhone: metadata.contactPhone,
      companyName: metadata.companyName || '',
      status: 'pending', // Will be confirmed by admin
      paymentStatus: 'pending',
      invoiceOption: metadata.invoiceOption !== 'no_invoice', // Convert to boolean
      invoiceDetails: invoiceDetails,
      additionalServices,
      stripeSetupIntentId: setupIntent.id,
      stripeCustomerId: setupIntent.customer as string,
      captureMethod: 'deferred',
      requiresPayment: true,
      confirmationNumber,
      isPartialPrivatization: metadata.isPartialPrivatization === 'true',
      message: metadata.message || '',
    });
    // Send card saved email to customer
    try {
      const spaceConfig = await SpaceConfiguration.findOne({ spaceType: metadata.spaceType });

      await sendCardSavedConfirmation(metadata.contactEmail, {
        name: metadata.contactName,
        spaceName: spaceConfig?.name || getSpaceTypeName(metadata.spaceType),
        date: new Date(metadata.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        startTime: metadata.startTime || '',
        endTime: metadata.endTime || '',
        totalPrice: parseFloat(metadata.totalPrice),
      });    } catch (emailError) {      // Don't fail the booking creation if email fails
    }
  } catch (error) {    throw error;
  }
}
