import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { Types } from "mongoose";

/**
 * Interface for populated booking document
 */
interface PopulatedBooking {
  _id: Types.ObjectId;
  user?: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  spaceType: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  cancelledAt?: string;
  cancelReason?: string;
  contactName?: string;
  contactEmail?: string;
  isAdminBooking?: boolean;
  save(): Promise<PopulatedBooking>;
  toObject(): PopulatedBooking;
}

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
    booking.cancelledAt = new Date();
    booking.cancelReason = reason || "Annulée par l'administrateur";
    await booking.save();

    // Populate user for email
    await booking.populate('user', 'firstName lastName email');

    // Type assertion après populate
    const populatedBooking = booking as unknown as PopulatedBooking;

    // Préparer les données pour l'email
    const user = populatedBooking.user;
    const clientName = (user?.firstName && user?.lastName)
      ? `${user.firstName} ${user.lastName}`
      : populatedBooking.contactName || user?.email || populatedBooking.contactEmail || 'Client';

    const emailData = {
      name: clientName,
      spaceName: populatedBooking.spaceType,
      date: populatedBooking.date.toISOString().split("T")[0],
      startTime: populatedBooking.startTime || '',
      endTime: populatedBooking.endTime || '',
      numberOfPeople: populatedBooking.numberOfPeople,
      totalPrice: populatedBooking.totalPrice,
      reason: reason || undefined,
    };

    // Envoyer l'email d'annulation
    try {
      const { sendEmail } = await import('@/lib/email/emailService');
      const recipientEmail = user?.email || populatedBooking.contactEmail;

      if (!recipientEmail) {
        console.warn('⚠️ Aucun email trouvé pour envoyer la notification d\'annulation');
      } else {
        // Choisir le template selon isAdminBooking
        if (populatedBooking.isAdminBooking) {
          // Template admin : pas de mention de libération d'empreinte bancaire
          const { generateAdminBookingCancellationEmail } = await import('@coworking-cafe/email');

          await sendEmail({
            to: recipientEmail,
            subject: '❌ Réservation annulée - CoworKing Café',
            html: generateAdminBookingCancellationEmail(emailData),
          });
        } else {
          // Template classique : avec mention de libération d'empreinte bancaire
          const { generateReservationRejectedEmail } = await import('@coworking-cafe/email');

          await sendEmail({
            to: recipientEmail,
            subject: '❌ Réservation annulée - CoworKing Café',
            html: generateReservationRejectedEmail({
              ...emailData,
              confirmationNumber: populatedBooking._id.toString(),
            }),
          });
        }

        console.log('✅ Email d\'annulation envoyé:', recipientEmail);
      }
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
