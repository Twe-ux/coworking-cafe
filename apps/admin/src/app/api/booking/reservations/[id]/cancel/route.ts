import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";

/**
 * POST /api/booking/reservations/[id]/cancel
 * Cancel a booking (pending or confirmed)
 * Only accessible by dev/admin/manager
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectMongoose();

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse("Réservation introuvable", "Booking not found", 404);
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return errorResponse(
        "Réservation déjà annulée",
        "Booking already cancelled",
        400
      );
    }

    // Update status to cancelled
    booking.status = "cancelled";
    (booking as any).cancelledAt = new Date().toISOString();
    (booking as any).cancelReason = reason || "Annulée par l'administrateur";
    await booking.save();

    // Populate user for email
    await booking.populate('user', 'firstName lastName email');

    // Préparer les données pour l'email
    const user = (booking as any).user || {};
    const clientName = (user.firstName && user.lastName)
      ? `${user.firstName} ${user.lastName}`
      : (booking as any).contactName || user.email || (booking as any).contactEmail || 'Client';

    const emailData = {
      name: clientName,
      spaceName: booking.spaceType,
      date: booking.date.toISOString().split("T")[0],
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      numberOfPeople: booking.numberOfPeople,
      totalPrice: booking.totalPrice,
      reason: reason || undefined,
    };

    // Envoyer l'email d'annulation
    try {
      const { sendEmail } = await import('@/lib/email/emailService');

      // Choisir le template selon isAdminBooking
      if ((booking as any).isAdminBooking) {
        // Template admin : pas de mention de libération d'empreinte bancaire
        const { generateAdminBookingCancellationEmail } = await import('@coworking-cafe/email');

        await sendEmail({
          to: user.email || (booking as any).contactEmail,
          subject: '❌ Réservation annulée - CoworKing Café',
          html: generateAdminBookingCancellationEmail(emailData),
        });
      } else {
        // Template classique : avec mention de libération d'empreinte bancaire
        const { generateReservationRejectedEmail } = await import('@coworking-cafe/email');

        await sendEmail({
          to: user.email || (booking as any).contactEmail,
          subject: '❌ Réservation annulée - CoworKing Café',
          html: generateReservationRejectedEmail({
            ...emailData,
            confirmationNumber: booking._id.toString(),
          }),
        });
      }

      console.log('✅ Email d\'annulation envoyé:', user.email || (booking as any).contactEmail);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas bloquer l'annulation si l'email échoue
    }

    return successResponse(
      {
        _id: booking._id,
        status: booking.status,
        cancelReason: booking.cancelReason,
      },
      "Réservation annulée avec succès"
    );
  } catch (error) {
    console.error("[API] Cancel booking error:", error);
    return errorResponse(
      "Erreur lors de l'annulation de la réservation",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
