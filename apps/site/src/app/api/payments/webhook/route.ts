import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import { Reservation } from '@/models/reservation';
import { verifyWebhookSignature, stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import type { CardBrand } from '@/models/payment/document';
import { sendBookingConfirmation, sendCardSavedConfirmation } from '@/lib/email/emailService';
import { getSpaceTypeName } from '@/lib/space-names';
import { User } from '@/models/user';
import { Newsletter } from '@coworking-cafe/database';
import { createUser, findUserByEmail } from '@/lib/auth-helpers';
import { Role } from '@/models/role';

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
    const booking = await Reservation.findById(payment.booking);
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
    const booking = await Reservation.findById(payment.booking);
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
      const booking = await Reservation.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'refunded';
        await booking.save();      }
    }
  } catch (error) {    throw error;
  }
}

/**
 * Helper: Create or update user from booking metadata
 * Handles account creation and newsletter/account fusion
 *
 * @param metadata - Stripe metadata containing user data
 * @returns userId to use for booking, or null if no account created
 */
async function createOrUpdateUser(metadata: Record<string, string>): Promise<string | null> {
  // Check if user wants to create an account
  if (metadata.createAccount !== 'true') {
    return metadata.userId || null;
  }

  // Account creation requested - check if we have required data
  if (!metadata.contactEmail || !metadata.password) {
    console.warn('[Webhook] Account creation requested but missing email or password');
    return metadata.userId || null;
  }

  try {
    const email = metadata.contactEmail.toLowerCase();

    // Check if user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      // User exists - check if it's a temporary newsletter-only account
      if (existingUser.isTemporary) {
        console.log(`[Webhook] Upgrading temporary account to full account: ${email}`);

        // Upgrade to full account with password
        existingUser.password = metadata.password; // Will be hashed by pre-save hook
        existingUser.isTemporary = false;
        existingUser.givenName = metadata.contactName || existingUser.givenName;
        existingUser.phone = metadata.contactPhone || existingUser.phone;
        existingUser.companyName = metadata.companyName || existingUser.companyName;

        // Update newsletter preference if requested
        if (metadata.subscribeNewsletter === 'true') {
          existingUser.newsletter = true;
        }

        await existingUser.save();

        // Update newsletter entry to link userId if needed
        await Newsletter.findOneAndUpdate(
          { email },
          {
            userId: existingUser._id,
            isSubscribed: existingUser.newsletter,
          },
          { upsert: false }
        );

        console.log(`[Webhook] Account upgraded successfully: ${email}`);
        return existingUser._id.toString();
      } else {
        // Full account already exists - just return the userId
        console.log(`[Webhook] User already has full account: ${email}`);
        return existingUser._id.toString();
      }
    }

    // User doesn't exist - create new account
    console.log(`[Webhook] Creating new user account: ${email}`);

    const newUser = await createUser({
      email,
      password: metadata.password,
      givenName: metadata.contactName,
      roleSlug: 'client',
      newsletter: metadata.subscribeNewsletter === 'true',
    });

    // Update phone and company name after creation (not in createUser signature)
    if (metadata.contactPhone) {
      newUser.phone = metadata.contactPhone;
    }
    if (metadata.companyName) {
      newUser.companyName = metadata.companyName;
    }
    await newUser.save();

    // Create/update newsletter entry
    await Newsletter.findOneAndUpdate(
      { email },
      {
        email,
        userId: newUser._id,
        isSubscribed: metadata.subscribeNewsletter === 'true',
        subscribedAt: metadata.subscribeNewsletter === 'true' ? new Date() : undefined,
        source: 'registration',
      },
      { upsert: true, new: true }
    );

    console.log(`[Webhook] User account created successfully: ${email}`);
    return newUser._id.toString();

  } catch (error) {
    console.error('[Webhook] Error creating/updating user:', error);
    // Don't fail the booking if user creation fails
    return metadata.userId || null;
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
    const existingBooking = await Reservation.findOne({
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

    // Create or update user account if requested (before creating booking)
    const userId = await createOrUpdateUser(metadata);

    // Create reservation
    let reservation;
    try {
      reservation = await Reservation.create({
        spaceType: metadata.spaceType,
        date: new Date(metadata.date),
        startTime: metadata.startTime,
        endTime: metadata.endTime,
        numberOfPeople: parseInt(metadata.numberOfPeople),
        totalPrice: parseFloat(metadata.totalPrice),
        user: userId,
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
      const SpaceConfiguration = (await import('@/models/spaceConfiguration')).default;
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
        depositAmount: parseInt(metadata.depositAmount || metadata.totalPrice) || parseFloat(metadata.totalPrice) * 100, // Use stored deposit amount in cents
        captureMethod: metadata.captureMethod as 'manual' | 'automatic',
        numberOfPeople: parseInt(metadata.numberOfPeople),
      });    } catch (emailError) {      // Don't fail the booking creation if email fails
    }
  } catch (error) {    throw error;
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
    const existingBooking = await Reservation.findOne({
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

    // Create or update user account if requested (before creating booking)
    const userId = await createOrUpdateUser(metadata);

    // Create reservation
    const reservation = await Reservation.create({
      spaceType: metadata.spaceType,
      date: new Date(metadata.date),
      startTime: metadata.startTime,
      endTime: metadata.endTime,
      numberOfPeople: parseInt(metadata.numberOfPeople),
      totalPrice: parseFloat(metadata.totalPrice),
      user: userId,
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
      const SpaceConfiguration = (await import('@/models/spaceConfiguration')).default;
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
