import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking, Space, User } from "@coworking-cafe/database";
import { getAuthUser, requireAuth, handleApiError } from '@/lib/api-helpers';
import { getSpaceTypeName } from '@/lib/space-names';
import mongoose from 'mongoose';
import { sendClientBookingConfirmation } from '@/lib/email/emailService';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings
 * Get list of bookings
 * - Regular users see only their bookings
 * - Admins see all bookings
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(['admin', 'staff', 'dev', 'client']);

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const spaceId = searchParams.get('spaceId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query
    const query: Record<string, unknown> = {};

    // Check if user is admin
    const isAdminOrStaff = user && ['admin', 'staff', 'dev'].includes(user.role?.slug || '');

    // Regular users can only see their own bookings
    if (!isAdminOrStaff) {
      query.user = user.id;
    } else if (userId) {
      // Admin can filter by userId
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (spaceId) {
      if (mongoose.Types.ObjectId.isValid(spaceId)) {
        query.space = spaceId;
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    // Execute query
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'username name email')
        .populate('space', 'name slug type featuredImage pricing')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    // Transform bookings to ensure space.name is always set
    // For new bookings that use spaceType, create a virtual space object with the French name
    const transformedBookings = bookings.map((booking: any) => {
      if (!booking.space && booking.spaceType) {
        return {
          ...booking,
          space: {
            name: getSpaceTypeName(booking.spaceType),
            type: booking.spaceType,
            location: '1 Boulevard Leblois, 67000 Strasbourg',
          },
        };
      }
      return booking;
    });

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth();

    const body = await request.json();

    // Validate required fields
    const { spaceId, date, startTime, endTime, numberOfPeople } = body;

    if (!spaceId || !date || !startTime || !endTime || !numberOfPeople) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: spaceId, date, startTime, endTime, numberOfPeople',
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(spaceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid space ID' },
        { status: 400 }
      );
    }

    // Check if space exists and is active
    const space = await Space.findById(spaceId);

    if (!space || space.isDeleted || !space.isActive) {
      return NextResponse.json(
        { success: false, error: 'Space not found or unavailable' },
        { status: 404 }
      );
    }

    // Validate capacity
    if (numberOfPeople > space.capacity) {
      return NextResponse.json(
        { success: false, error: `This space has a maximum capacity of ${space.capacity} people` },
        { status: 400 }
      );
    }

    // Validate date (must be in the future)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return NextResponse.json(
        { success: false, error: 'Booking date must be in the future' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format. Use HH:mm' },
        { status: 400 }
      );
    }

    // Check if end time is after start time
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

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      space: spaceId,
      date: bookingDate,
      status: { $nin: ['cancelled'] },
      $or: [
        // New booking starts during existing booking
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        // New booking ends during existing booking
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } },
          ],
        },
        // New booking completely contains existing booking
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } },
          ],
        },
      ],
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'This time slot is already booked. Please choose another time.',
        },
        { status: 409 }
      );
    }

    // Calculate duration in hours
    const durationMinutes = endMinutes - startMinutes;
    const durationHours = durationMinutes / 60;

    // Calculate price based on duration and space pricing
    let totalPrice = 0;

    if (space.pricing?.hourly) {
      totalPrice = space.pricing.hourly * durationHours;
    } else if (space.pricing?.daily && durationHours >= 4) {
      totalPrice = space.pricing.daily;
    } else {
      return NextResponse.json(
        { success: false, error: 'No pricing configured for this space' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      user: user.id,
      space: spaceId,
      date: bookingDate,
      startTime,
      endTime,
      numberOfPeople,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
      notes: body.notes,
      specialRequests: body.specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Populate space details
    await booking.populate('space', 'name slug type featuredImage pricing');

    // Send confirmation email to client
    try {
      // Get user details
      const userDoc = await User.findById(user.id);

      if (userDoc && userDoc.email) {
        // Format date
        const formattedDate = new Date(bookingDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Get space name
        const spaceName = booking.space?.name || space.name;

        // Send email using existing function
        await sendClientBookingConfirmation(userDoc.email, {
          name: userDoc.givenName || userDoc.name || 'Client',
          spaceName,
          date: formattedDate,
          startTime,
          endTime,
          numberOfPeople,
          totalPrice,
          confirmationNumber: booking._id.toString(),
        });

        console.log('✅ Booking confirmation email sent to:', userDoc.email);
      }
    } catch (emailError) {
      // Log error but don't fail the booking creation
      console.error('❌ Failed to send booking confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
