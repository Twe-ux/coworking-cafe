import { NextRequest, NextResponse } from "next/server";
import { Booking, stripe } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { checkAPIIPAccess } from "@/lib/api/ip-check";
import { successResponse, errorResponse } from "@/lib/api/response";
import { sendClientPresentEmail } from "@/lib/email/emailService";
import type { Document, Types } from "mongoose";

/**
 * Interface for populated User in Booking
 * Matches the fields selected in .populate('user', 'firstName lastName email')
 */
interface PopulatedUser {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
}

/**
 * Interface for populated Space in Booking
 * Matches the fields selected in .populate('space', 'name')
 */
interface PopulatedSpace {
  _id: Types.ObjectId;
  name: string;
}

/**
 * Interface for Booking with populated references
 * Extends BookingDocument but replaces ObjectId references with populated documents
 */
interface BookingWithPopulatedFields extends Omit<Document, '_id' | 'id'> {
  _id: Types.ObjectId;
  user: PopulatedUser | Types.ObjectId;
  space?: PopulatedSpace | Types.ObjectId;
  spaceType: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  save(): Promise<this>;
}

/**
 * Type guard to check if user is populated
 */
function isPopulatedUser(user: PopulatedUser | Types.ObjectId): user is PopulatedUser {
  return user && typeof user === 'object' && 'email' in user;
}

/**
 * Type guard to check if space is populated
 */
function isPopulatedSpace(space: PopulatedSpace | Types.ObjectId | undefined): space is PopulatedSpace {
  return space !== undefined && space !== null && typeof space === 'object' && 'name' in space;
}

/**
 * POST /api/booking/reservations/[id]/mark-present
 * Mark a confirmed booking as completed (client showed up)
 * Releases the card hold (if applicable)
 * Accessible by dev/admin/manager/staff
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // IP check - staff dashboard can mark presence
  const ipCheckResult = checkAPIIPAccess(request);
  if (ipCheckResult) {
    return ipCheckResult;
  }

  try {
    await connectMongoose();

    const { id } = params;

    // Find the booking with populated fields
    const booking = await Booking.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('space', 'name') as BookingWithPopulatedFields | null;

    if (!booking) {
      return errorResponse("Réservation introuvable", "Booking not found", 404);
    }

    // Check if booking is confirmed
    if (booking.status !== "confirmed") {
      return errorResponse(
        "Réservation non confirmée",
        `Booking status is ${booking.status}`,
        400
      );
    }

    // Update status to completed
    booking.status = "completed";
    await booking.save();

    // Release Stripe card hold (if captureMethod is manual/deferred)
    const bookingDoc = booking as unknown as {
      stripePaymentIntentId?: string;
      captureMethod?: string;
      isAdminBooking?: boolean;
    };

    if (bookingDoc.stripePaymentIntentId &&
        bookingDoc.captureMethod === 'manual' &&
        !bookingDoc.isAdminBooking) {
      try {
        await stripe.paymentIntents.cancel(bookingDoc.stripePaymentIntentId);
        console.log(`[API] Released payment intent: ${bookingDoc.stripePaymentIntentId}`);
      } catch (stripeError) {
        console.error("[API] Error releasing Stripe payment intent:", stripeError);
        // Don't fail the request if Stripe release fails - booking is still marked as present
      }
    }

    // Send email to client confirming presence and card hold release
    try {
      const bookingDate = booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date);

      // Check if user is populated and has email
      if (isPopulatedUser(booking.user) && booking.user.email) {
        const user = booking.user;
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client';
        const spaceName = isPopulatedSpace(booking.space) ? booking.space.name : 'Espace';

        await sendClientPresentEmail(
          user.email,
          {
            name: userName,
            spaceName,
            date: bookingDate,
            startTime: booking.startTime || '09:00',
            endTime: booking.endTime || '18:00',
            numberOfPeople: booking.numberOfPeople || 1,
            totalPrice: booking.totalPrice || 0,
          }
        );
      }
    } catch (emailError) {
      console.error("[API] Error sending present email:", emailError);
      // Don't fail the request if email fails
    }

    return successResponse(
      {
        _id: booking._id,
        status: booking.status,
      },
      "Client marqué comme présent - Empreinte bancaire libérée"
    );
  } catch (error) {
    console.error("[API] Mark present error:", error);
    return errorResponse(
      "Erreur lors de la confirmation de présence",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
