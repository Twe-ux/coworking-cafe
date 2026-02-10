import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import BookingSettings from "@/models/bookingSettings";
import { businessDaysUntil } from "@/lib/business-days";

/**
 * GET /api/booking/reservations/[id]/calculate-cancellation-fees
 * Calculate cancellation fees for a booking WITHOUT actually cancelling it
 * Returns preview of fees to display to admin before confirmation
 */
export const dynamic = 'force-dynamic';

export async function GET(
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

    // Get booking settings for cancellation policy
    const settings = await BookingSettings.findOne();

    // Determine which cancellation policy to use based on space type
    const isMeetingRoom = [
      "meeting-room",
      "meeting-room-glass",
      "meeting-room-floor",
      "salle-verriere",
      "salle-etage",
    ].includes(booking.spaceType);

    const cancellationPolicy = isMeetingRoom
      ? settings?.cancellationPolicyMeetingRooms || [
          { daysBeforeBooking: 22, chargePercentage: 0 },
          { daysBeforeBooking: 15, chargePercentage: 30 },
          { daysBeforeBooking: 8, chargePercentage: 50 },
          { daysBeforeBooking: 0, chargePercentage: 70 },
        ]
      : settings?.cancellationPolicyOpenSpace || [
          { daysBeforeBooking: 7, chargePercentage: 0 },
          { daysBeforeBooking: 3, chargePercentage: 50 },
          { daysBeforeBooking: 0, chargePercentage: 100 },
        ];

    // Calculate business days until booking
    const bookingDate = new Date(booking.date);
    const daysUntilBooking = businessDaysUntil(bookingDate);

    // Determine cancellation charge percentage
    let chargePercentage = 100; // Default to full charge

    // IMPORTANT: Pending bookings (not yet validated by admin) can be cancelled without fees
    if (booking.status === "pending") {
      chargePercentage = 0;
    } else {
      // For confirmed bookings, apply cancellation policy based on days until booking
      const sortedTiers = [...cancellationPolicy].sort(
        (a, b) => b.daysBeforeBooking - a.daysBeforeBooking
      );

      for (const tier of sortedTiers) {
        if (daysUntilBooking >= tier.daysBeforeBooking) {
          chargePercentage = tier.chargePercentage;
          break;
        }
      }
    }

    // Calculate fees based on payment method
    let depositAmount = 0;
    let cancellationFee = 0;
    let refundAmount = 0;
    let hasPaymentIntent = false;

    if (booking.stripePaymentIntentId) {
      hasPaymentIntent = true;
      const { stripe } = await import('@coworking-cafe/database');

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId
        );

        depositAmount = paymentIntent.amount / 100; // Convert centimes to euros
        const bookingTotal = booking.totalPrice;

        // Calculate fee on total price
        const feeInEuros = (bookingTotal * chargePercentage) / 100;

        // Cap fee at deposit amount
        cancellationFee = Math.min(feeInEuros, depositAmount);
        refundAmount = depositAmount - cancellationFee;
      } catch (stripeError) {
        console.error("[Calculate Fees] Error retrieving payment intent:", stripeError);
        // Continue with calculation based on booking data
        depositAmount = booking.depositAmount || 0;
        const bookingTotal = booking.totalPrice;
        const feeInEuros = (bookingTotal * chargePercentage) / 100;
        cancellationFee = Math.min(feeInEuros, depositAmount);
        refundAmount = depositAmount - cancellationFee;
      }
    } else if (booking.depositAmount) {
      // Use deposit amount from booking if no payment intent
      depositAmount = booking.depositAmount;
      const bookingTotal = booking.totalPrice;
      const feeInEuros = (bookingTotal * chargePercentage) / 100;
      cancellationFee = Math.min(feeInEuros, depositAmount);
      refundAmount = depositAmount - cancellationFee;
    }

    return successResponse(
      {
        bookingId: booking._id,
        status: booking.status,
        totalPrice: booking.totalPrice,
        depositAmount,
        daysUntilBooking,
        chargePercentage,
        cancellationFee,
        refundAmount,
        hasPaymentIntent,
        isPending: booking.status === "pending",
        cancellationMessage:
          chargePercentage === 0
            ? "Aucun frais appliqué. L'empreinte bancaire sera annulée."
            : chargePercentage === 100
            ? "Annulation tardive. Le montant total sera retenu."
            : `Frais d'annulation de ${chargePercentage}% appliqués.`,
      },
      "Frais d'annulation calculés"
    );
  } catch (error) {
    console.error("[API] Calculate cancellation fees error:", error);
    return errorResponse(
      "Erreur lors du calcul des frais",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
