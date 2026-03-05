import { NextRequest, NextResponse } from "next/server";
import { Booking, stripe } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { checkAPIIPAccess } from "@/lib/api/ip-check";
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
  depositAmount?: number;
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
  // IP check - staff dashboard can mark no-show
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

    // Update status to no-show
    booking.status = "no-show";
    booking.cancelledAt = new Date().toISOString();
    booking.cancelReason = "No-show - Client ne s'est pas présenté";
    await booking.save();

    // Capture Stripe card hold (if captureMethod is manual/deferred)
    const bookingDoc = booking as unknown as {
      stripePaymentIntentId?: string;
      captureMethod?: string;
      isAdminBooking?: boolean;
      depositAmount?: number;
    };

    if (bookingDoc.stripePaymentIntentId &&
        bookingDoc.captureMethod === 'manual' &&
        !bookingDoc.isAdminBooking) {
      try {
        await stripe.paymentIntents.capture(
          bookingDoc.stripePaymentIntentId,
          {
            amount_to_capture: bookingDoc.depositAmount, // Capture deposit amount in cents
          }
        );
        console.log(`[API] Captured payment intent: ${bookingDoc.stripePaymentIntentId}`);
      } catch (stripeError) {
        console.error("[API] Error capturing Stripe payment intent:", stripeError);
        // Don't fail the request if Stripe capture fails - booking is still marked as no-show
      }
    }

    // Send no-show email to client
    // Only send email if booking has a Stripe payment intent (= card hold)
    if (bookingDoc.stripePaymentIntentId) {
      try {
        // Use same pattern as confirmation route
        const populatedUser = booking.user as PopulatedUser;
        const populatedSpace = booking.space as PopulatedSpace;
        const clientEmail = populatedUser?.email || (booking as any).contactEmail;
        const clientName = (populatedUser?.firstName && populatedUser?.lastName)
          ? `${populatedUser.firstName} ${populatedUser.lastName}`
          : (booking as any).contactName || populatedUser?.email || "Client";

        console.log("[API] Mark No-Show - Email check:", {
          hasUser: !!populatedUser,
          userEmail: populatedUser?.email,
          contactEmail: (booking as any).contactEmail,
          finalEmail: clientEmail,
        });

        if (clientEmail) {
          const bookingDate = booking.date instanceof Date
            ? booking.date.toISOString().split('T')[0]
            : String(booking.date);

          await sendClientNoShowEmail(
            clientEmail,
            {
              name: clientName,
              spaceName: populatedSpace?.name || 'Espace',
              date: bookingDate,
              startTime: booking.startTime || '09:00',
              endTime: booking.endTime || '18:00',
              numberOfPeople: booking.numberOfPeople || 1,
              depositAmount: booking.depositAmount || 0,
            }
          );
          console.log(`[API] Email no-show envoyé avec succès à: ${clientEmail}`);
        }
      } catch (emailError) {
        console.error("[API] Error sending no-show email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return successResponse(
      {
        _id: booking._id,
        status: booking.status,
        cancelReason: booking.cancelReason,
      },
      bookingDoc.stripePaymentIntentId
        ? "Client marqué comme no-show - Empreinte bancaire capturée"
        : "Client marqué comme no-show"
    );
  } catch (error) {
    console.error("[API] Mark no-show error:", error);
    return errorResponse(
      "Erreur lors du traitement du no-show",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
