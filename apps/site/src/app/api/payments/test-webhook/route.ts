import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking, SpaceConfiguration, User } from "@coworking-cafe/database";
import { sendBookingConfirmation, sendCardSavedConfirmation } from '@/lib/email/emailService';
import { urlToDbSpaceType } from '@/lib/space-types';
import mongoose from 'mongoose';

/**
 * POST /api/payments/test-webhook
 * TEMPORARY: Manually trigger webhook behavior for testing
 *
 * This endpoint manually creates a reservation from a payment intent ID
 * Used for testing until Stripe webhooks are properly configured
 *
 * Body: { paymentIntentId: string }
 *
 * TODO: Remove this endpoint once Stripe webhooks are configured in production
 */
export async function POST(request: NextRequest) {
  // TEMPORARY: Allow in production until webhooks are configured
  // This will be removed once proper Stripe webhooks are set up

  try {
    await connectDB();

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    // Get the payment intent from Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // DEBUG: Log payment intent metadata
    console.log('🔍 Payment Intent Metadata:', JSON.stringify(paymentIntent.metadata, null, 2));
    console.log('🔍 Contact Email from metadata:', paymentIntent.metadata?.contactEmail);
    console.log('🔍 User ID from metadata:', paymentIntent.metadata?.userId);

    // Check if this payment should create a booking
    if (paymentIntent.metadata?.createBookingOnAuthorization !== 'true') {
      return NextResponse.json(
        { error: 'Payment intent does not have createBookingOnAuthorization flag' },
        { status: 400 }
      );
    }

    // Check if booking already exists
    const existingBooking = await Booking.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: true,
          message: 'Booking already exists',
          bookingId: existingBooking._id,
        },
        { status: 200 }
      );
    }

    // Parse reservation data from metadata
    const metadata = paymentIntent.metadata;

    // Find or create user from metadata
    let userId = null;

    if (metadata.contactEmail) {
      try {
        const bcrypt = require('bcryptjs');
        let user = await User.findOne({ email: metadata.contactEmail });

        // Get client role
        const Role = mongoose.model('Role');
        const clientRole = await Role.findOne({ slug: 'client' });

        if (!clientRole) {
          console.error('❌ Client role not found in database');
          return NextResponse.json(
            { success: false, error: 'Configuration error: client role missing' },
            { status: 500 }
          );
        }

        if (!user) {
          // Create new user
          const shouldCreateAccount = metadata.createAccount === 'true';
          const userPassword = metadata.password;

          if (shouldCreateAccount && userPassword) {
            // Permanent account with user password
            const hashedPassword = await bcrypt.hash(userPassword, 10);
            user = await User.create({
              email: metadata.contactEmail,
              givenName: metadata.contactName,
              phone: metadata.contactPhone,
              username: metadata.contactEmail.split('@')[0] + '_' + Date.now(),
              password: hashedPassword,
              role: clientRole._id,
              newsletter: metadata.subscribeNewsletter === 'true',
              isTemporary: false,
            });
            console.log('✅ Created permanent user account:', user.email);
          } else {
            // Temporary account with random password
            const randomPassword = Math.random().toString(36).substring(2, 15) +
                                 Math.random().toString(36).substring(2, 15);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await User.create({
              email: metadata.contactEmail,
              givenName: metadata.contactName,
              phone: metadata.contactPhone,
              username: metadata.contactEmail.split('@')[0] + '_' + Date.now(),
              password: hashedPassword,
              role: clientRole._id,
              newsletter: metadata.subscribeNewsletter === 'true',
              isTemporary: true,
            });
            console.log('✅ Created temporary user account:', user.email);
          }
        } else {
          // User exists - update if needed
          const shouldCreateAccount = metadata.createAccount === 'true';
          const userPassword = metadata.password;

          if (user.isTemporary && shouldCreateAccount && userPassword) {
            // Convert temporary to permanent
            const hashedPassword = await bcrypt.hash(userPassword, 10);
            await User.findByIdAndUpdate(user._id, {
              password: hashedPassword,
              givenName: metadata.contactName,
              phone: metadata.contactPhone,
              newsletter: metadata.subscribeNewsletter === 'true',
              isTemporary: false,
            });
            console.log('✅ Converted temporary user to permanent:', user.email);
          } else if (metadata.subscribeNewsletter !== undefined) {
            // Just update info
            await User.findByIdAndUpdate(user._id, {
              givenName: metadata.contactName,
              phone: metadata.contactPhone,
              newsletter: metadata.subscribeNewsletter === 'true',
            });
            console.log('✅ Updated existing user info:', user.email);
          }
        }

        userId = user._id;
        console.log('✅ User ID assigned to booking:', userId);
      } catch (userError) {
        console.error('❌ Error creating/finding user:', userError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create user account: ' + (userError as Error).message
          },
          { status: 500 }
        );
      }
    }

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

    // Map URL space type to database value
    const dbSpaceType = urlToDbSpaceType(metadata.spaceType);

    // Create reservation (using old Reservation format for compatibility)
    const reservation = await Booking.create({
      spaceType: dbSpaceType,
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
    });
    // Send confirmation email to customer
    try {
      const spaceConfig = await SpaceConfiguration.findOne({ spaceType: dbSpaceType });

      console.log('📧 Attempting to send email to:', metadata.contactEmail);
      console.log('📧 Email data:', {
        name: metadata.contactName,
        spaceName: spaceConfig?.name || metadata.spaceType,
        price: parseFloat(metadata.totalPrice),
      });

      await sendBookingConfirmation(metadata.contactEmail, {
        name: metadata.contactName,
        spaceName: spaceConfig?.name || metadata.spaceType,
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
      });
      console.log('✅ Email sent successfully to:', metadata.contactEmail);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.error('❌ Email error details:', emailError instanceof Error ? emailError.message : 'Unknown error');
      // Don't fail the booking creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation created successfully',
      data: {
        bookingId: reservation._id,
        confirmationNumber: reservation.confirmationNumber,
      },
    });
  } catch (error) {    return NextResponse.json(
      {
        error: 'Failed to create reservation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
