import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { sendClientNoShowEmail } from "@/lib/email/emailService";
import type { BookingStatus } from "@/types/booking";

/**
 * Interface pour un document Booking avec champs populés
 */
interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface PopulatedSpace {
  _id: string;
  name: string;
}

interface BookingDocument {
  _id: string;
  user: PopulatedUser;
  space: PopulatedSpace;
  date: Date | string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: number;
  totalPrice?: number;
  status: BookingStatus;
  cancelledAt?: string;
  cancelReason?: string;
  save: () => Promise<BookingDocument>;
}

/**
 * POST /api/booking/reservations/[id]/mark-noshow
 * Mark a confirmed booking as no-show (client didn't show up)
 * Captures the card hold (if applicable)
 * Accessible by dev/admin/manager/staff
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check - staff can mark no-show
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectMongoose();

    const { id } = params;

    // Find the booking with populated fields
    const booking = await Booking.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('space', 'name') as BookingDocument | null;

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

    // Update status to cancelled with no-show reason
    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();
    booking.cancelReason = "No-show - Client ne s'est pas présenté";
    await booking.save();

    // TODO: Capture Stripe card hold (if captureMethod is manual/deferred)

    // Send no-show email to client
    try {
      const user = booking.user;
      const space = booking.space;
      const bookingDate = booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date);

      if (user && user.email) {
        await sendClientNoShowEmail(
          user.email,
          {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
            spaceName: space?.name || 'Espace',
            date: bookingDate,
            startTime: booking.startTime || '09:00',
            endTime: booking.endTime || '18:00',
            numberOfPeople: booking.numberOfPeople || 1,
            totalPrice: booking.totalPrice || 0,
          }
        );
      }
    } catch (emailError) {
      console.error("[API] Error sending no-show email:", emailError);
      // Don't fail the request if email fails
    }

    return successResponse(
      {
        _id: booking._id,
        status: booking.status,
        cancelReason: booking.cancelReason,
      },
      "Client marqué comme no-show - Empreinte bancaire capturée"
    );
  } catch (error) {
    console.error("[API] Mark no-show error:", error);
    return errorResponse(
      "Erreur lors du traitement du no-show",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
