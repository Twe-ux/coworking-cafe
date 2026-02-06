import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db';
import { Booking } from "@coworking-cafe/database";
import { SpaceConfiguration } from "@coworking-cafe/database";
import { User } from "@coworking-cafe/database";
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import { sendBookingInitialEmail } from '@/lib/email/emailService';
import { urlToDbSpaceType } from '@/lib/space-types';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      spaceType,
      date,
      startTime,
      endTime,
      numberOfPeople,
      reservationType,
      basePrice,
      servicesPrice,
      totalPrice,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      additionalServices,
      requiresPayment,
      createAccount,
      subscribeNewsletter,
      password,
    } = body;

    // Validation
    if (!spaceType || !date || !startTime || !endTime || !numberOfPeople) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!contactName || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { success: false, error: 'Contact information is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find or create user
    let userId;
    if (session?.user) {
      // User is logged in
      userId = session.user.id;

      // Update newsletter preference if user is logged in
      if (subscribeNewsletter !== undefined) {
        try {
          await User.findByIdAndUpdate(userId, { newsletter: subscribeNewsletter });
        } catch (error) {
    }
      }
    } else {
      // Create or find guest user by email
      try {
        let user = await User.findOne({ email: contactEmail });

        // Find the default "client" role
        const Role = mongoose.model('Role');
        const clientRole = await Role.findOne({ slug: 'client' });

        if (!clientRole) {          return NextResponse.json(
            { success: false, error: 'Default client role not found in database' },
            { status: 500 }
          );
        }

        const bcrypt = require('bcryptjs');

        if (!user) {
          // Create new user
          if (createAccount && password) {
            // Create permanent account with user-provided password
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
              email: contactEmail,
              givenName: contactName,
              phone: contactPhone,
              username: contactEmail.split('@')[0] + '_' + Date.now(),
              password: hashedPassword,
              role: clientRole._id,
              newsletter: subscribeNewsletter || false,
              isTemporary: false,
            });
          } else {
            // Create temporary user with random password
            const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await User.create({
              email: contactEmail,
              givenName: contactName,
              phone: contactPhone,
              username: contactEmail.split('@')[0] + '_' + Date.now(),
              password: hashedPassword,
              role: clientRole._id,
              newsletter: subscribeNewsletter || false,
              isTemporary: true,
            });
          }
        } else {
          // User exists - update if needed
          if (user.isTemporary && createAccount && password) {
            // Convert temporary user to permanent account
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate(user._id, {
              password: hashedPassword,
              givenName: contactName,
              phone: contactPhone,
              newsletter: subscribeNewsletter || false,
              isTemporary: false,
            });
          } else if (subscribeNewsletter !== undefined) {
            // Just update newsletter preference
            await User.findByIdAndUpdate(user._id, {
              newsletter: subscribeNewsletter,
              givenName: contactName,
              phone: contactPhone,
            });
          }
        }

        userId = user._id;
      } catch (userError) {        return NextResponse.json(
          { success: false, error: 'Failed to create guest user: ' + (userError as Error).message },
          { status: 500 }
        );
      }
    }

    // Map URL space types to database spaceType values
    const dbSpaceType = urlToDbSpaceType(spaceType);

    // Find space configuration
    const spaceConfig = await SpaceConfiguration.findOne({
      spaceType: dbSpaceType,
      isActive: true,
      isDeleted: false,
    });

    if (!spaceConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `No active space configuration found for type: ${spaceType}`,
        },
        { status: 404 }
      );
    }

    // Check if space requires a quote instead of direct booking
    if (spaceConfig.requiresQuote) {
      return NextResponse.json(
        {
          success: false,
          error: 'This space requires a custom quote. Please contact us directly.',
        },
        { status: 400 }
      );
    }

    // Validate booking date is in the future
    const bookingDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < now) {
      return NextResponse.json(
        { success: false, error: 'Booking date must be in the future' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format' },
        { status: 400 }
      );
    }

    // Validate end time is after start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Note: Pas de vérification de chevauchement - plusieurs réservations simultanées sont autorisées

    // Calculate deposit amount if deposit policy is enabled
    let depositAmount: number | undefined;
    let captureMethod: 'manual' | 'automatic' | undefined;

    if (spaceConfig.depositPolicy?.enabled && requiresPayment !== false) {
      const totalPriceInCents = (totalPrice || basePrice || 0) * 100;
      const policy = spaceConfig.depositPolicy;
      let depositInCents = totalPriceInCents;

      if (policy.fixedAmount) {
        depositInCents = policy.fixedAmount;
      } else if (policy.percentage) {
        depositInCents = Math.round(totalPriceInCents * (policy.percentage / 100));
      }

      if (policy.minimumAmount && depositInCents < policy.minimumAmount) {
        depositInCents = policy.minimumAmount;
      }

      depositAmount = depositInCents;

      // Determine capture method based on booking date
      const daysUntilBooking = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      captureMethod = daysUntilBooking <= 7 ? 'manual' : 'automatic';
    }

    // Create the reservation with deposit info
    const reservation = await Booking.create({
      user: userId,
      spaceType: dbSpaceType,
      date: bookingDate,
      startTime,
      endTime,
      numberOfPeople,
      status: 'pending',
      reservationType: reservationType || 'hourly',
      basePrice: basePrice || 0,
      servicesPrice: servicesPrice || 0,
      totalPrice: totalPrice || basePrice || 0,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      additionalServices: additionalServices || [],
      requiresPayment: requiresPayment !== false, // Default to true
      paymentStatus: 'pending',
      depositAmount,
      captureMethod,
    });

    // Populate the reservation with user details
    const populatedReservation = await Booking.findById(reservation._id)
      .populate('user', 'name email');

    // Send confirmation email
    try {
      // Format additional services for email
      const emailServices = (additionalServices || []).map((service: any) => ({
        name: service.name || service.serviceName || 'Service',
        quantity: service.quantity || 1,
        price: service.unitPrice || service.price || 0,
      }));

      await sendBookingInitialEmail(contactEmail, {
        name: contactName,
        spaceName: spaceConfig.name,
        date: bookingDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: `${startTime} - ${endTime}`,
        price: totalPrice || basePrice || 0,
        bookingId: (reservation._id as mongoose.Types.ObjectId).toString(),
        requiresPayment: requiresPayment !== false,
        depositAmount,
        captureMethod,
        additionalServices: emailServices,
        numberOfPeople,
      });
    } catch (emailError) {
      // Don't fail the whole request if email fails
    }

    // Send push notification to admin
    try {
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
      const notificationsSecret = process.env.NOTIFICATIONS_SECRET;

      console.log('[Booking] Attempting to send admin notification...', {
        adminUrl,
        hasSecret: !!notificationsSecret,
        bookingId: (reservation._id as mongoose.Types.ObjectId).toString(),
      });

      if (notificationsSecret) {
        const notifResponse = await fetch(`${adminUrl}/api/notifications/booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${notificationsSecret}`,
          },
          body: JSON.stringify({
            bookingId: (reservation._id as mongoose.Types.ObjectId).toString(),
          }),
        });

        const notifResult = await notifResponse.json().catch(() => ({}));
        console.log('[Booking] Admin notification response:', {
          status: notifResponse.status,
          ok: notifResponse.ok,
          result: notifResult,
        });

        if (notifResponse.ok) {
          console.log('[Booking] Admin notification sent for new booking');
        } else {
          console.error('[Booking] Admin notification failed:', notifResult);
        }
      } else {
        console.warn('[Booking] NOTIFICATIONS_SECRET not configured, skipping notification');
      }
    } catch (notifError) {
      // Don't fail the booking creation if notification fails
      console.error('[Booking] Failed to send admin notification:', notifError);
    }

    return NextResponse.json(
      {
        success: true,
        data: populatedReservation,
        message: 'Reservation created successfully',
      },
      { status: 201 }
    );
  } catch (error) {    return NextResponse.json(
      { success: false, error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
