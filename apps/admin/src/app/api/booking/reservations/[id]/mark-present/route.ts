import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { sendClientPresentEmail } from "@/lib/email/emailService";

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
  // Auth check - staff can mark presence
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
      .populate('space', 'name');

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

    // TODO: Release Stripe card hold (if captureMethod is manual/deferred)

    // Send email to client confirming presence and card hold release
    try {
      const user = (booking.user as any);
      const space = (booking.space as any);
      const bookingDate = booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date);

      if (user && user.email) {
        await sendClientPresentEmail(
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
