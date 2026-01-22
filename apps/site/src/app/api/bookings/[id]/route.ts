import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking } from "@coworking-cafe/database";
import { Space } from "@coworking-cafe/database";
import { getAuthUser, requireAuth, handleApiError } from '@/lib/api-helpers';
import mongoose from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings/[id]
 * Get booking details
 * - Anyone can view a booking by ID (for confirmation pages)
 * - Auth users can only see their own bookings unless admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser();
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id)
      .populate('user', 'username name email')
      .populate('space', 'name slug type featuredImage pricing')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If user is authenticated, check permissions
    if (user) {
      const isAdminOrStaff = ['admin', 'staff', 'dev'].includes(user.role?.slug || '');
      const bookingUserId = typeof booking.user === 'object' && booking.user !== null && '_id' in booking.user
        ? (booking.user._id as unknown as string).toString()
        : booking.user?.toString();
      const isOwner = booking.user && bookingUserId === user.id;

      if (!isAdminOrStaff && !isOwner) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to view this booking' },
          { status: 403 }
        );
      }
    }
    // If not authenticated, allow viewing (for guest bookings confirmation)

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking details
 * - Users can only update their own pending bookings
 * - Admins can update any booking
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth();
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdminOrStaff = user && ['admin', 'staff', 'dev'].includes(user.role?.slug || '');
    const isOwner = booking.user.toString() === user.id;

    if (!isAdminOrStaff && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    // Non-admin users can only update pending bookings
    if (!isAdminOrStaff && booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Can only update pending bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields based on role
    const allowedFields = isAdminOrStaff
      ? ['date', 'startTime', 'endTime', 'numberOfPeople', 'notes', 'specialRequests', 'status', 'paymentStatus']
      : ['date', 'startTime', 'endTime', 'numberOfPeople', 'notes', 'specialRequests'];

    // Validate and update date/time if changed
    if (body.date || body.startTime || body.endTime) {
      const newDate = body.date ? new Date(body.date) : booking.date;
      const newStartTime = body.startTime || booking.startTime;
      const newEndTime = body.endTime || booking.endTime;

      // Validate date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate < today) {
        return NextResponse.json(
          { success: false, error: 'Booking date must be in the future' },
          { status: 400 }
        );
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(newStartTime) || !timeRegex.test(newEndTime)) {
        return NextResponse.json(
          { success: false, error: 'Invalid time format. Use HH:mm' },
          { status: 400 }
        );
      }

      // Check for overlapping bookings (exclude current booking)
      const overlappingBooking = await Booking.findOne({
        _id: { $ne: id },
        space: booking.space,
        date: newDate,
        status: { $nin: ['cancelled'] },
        $or: [
          {
            $and: [
              { startTime: { $lte: newStartTime } },
              { endTime: { $gt: newStartTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lt: newEndTime } },
              { endTime: { $gte: newEndTime } },
            ],
          },
          {
            $and: [
              { startTime: { $gte: newStartTime } },
              { endTime: { $lte: newEndTime } },
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
    }

    // Validate numberOfPeople if changed
    if (body.numberOfPeople) {
      const space = await Space.findById(booking.space);
      if (space && body.numberOfPeople > space.capacity) {
        return NextResponse.json(
          { success: false, error: `This space has a maximum capacity of ${space.capacity} people` },
          { status: 400 }
        );
      }
    }

    // Update allowed fields
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (booking as unknown as Record<string, unknown>)[field] = body[field];
      }
    });

    await booking.save();

    // Populate for response
    await booking.populate('space', 'name slug type featuredImage pricing');

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel a booking
 * - Users can cancel their own bookings if cancellable
 * - Admins can cancel any booking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth();
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdminOrStaff = user && ['admin', 'staff', 'dev'].includes(user.role?.slug || '');
    const isOwner = booking.user.toString() === user.id;

    if (!isAdminOrStaff && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel completed booking' },
        { status: 400 }
      );
    }

    // Check cancellation policy (24 hours before)
    if (!isAdminOrStaff) {
      if (!booking.startTime) {
        return NextResponse.json(
          { success: false, error: 'Booking has no start time' },
          { status: 400 }
        );
      }

      const bookingDateTime = new Date(booking.date);
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes);

      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < 24) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bookings must be cancelled at least 24 hours in advance',
          },
          { status: 400 }
        );
      }
    }

    // Cancel booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
