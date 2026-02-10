import { NextRequest, NextResponse } from "next/server";
import { Booking, Payment } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { Types } from "mongoose";
import BookingSettings from "@/models/bookingSettings";
import { businessDaysUntil } from "@/lib/business-days";

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
    const { reason, skipCapture } = body; // skipCapture: admin chooses not to capture deposit

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

    // IMPORTANT: Admin can choose to skip capture (skipCapture = true)
    if (skipCapture === true) {
      chargePercentage = 0;
      console.log(`[Cancel] Admin chose to skip capture - no fee`);
    }
    // IMPORTANT: Pending bookings (not yet validated by admin) can be cancelled without fees
    else if (booking.status === "pending") {
      chargePercentage = 0;
      console.log(`[Cancel] Pending booking - no cancellation fee`);
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

    console.log(`[Cancel] Days until booking: ${daysUntilBooking}, Charge: ${chargePercentage}%, Skip: ${skipCapture}`);

    // Handle Stripe payment
    const { stripe } = await import('@coworking-cafe/database');
    let refundAmount = 0;
    let cancellationFee = 0;

    if (booking.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        booking.stripePaymentIntentId
      );

      const depositAmount = paymentIntent.amount; // Empreinte en centimes (ex: 70€ = 7000)
      const bookingTotalInCents = Math.round(booking.totalPrice * 100); // Prix total en centimes (ex: 100€ = 10000)

      // Calculer les frais sur le PRIX TOTAL de la réservation
      cancellationFee = Math.round(
        (bookingTotalInCents * chargePercentage) / 100
      );

      // S'assurer que les frais ne dépassent jamais l'empreinte disponible
      // (ex: frais de 70€ max si empreinte de 70€)
      cancellationFee = Math.min(cancellationFee, depositAmount);

      // Montant à libérer = empreinte - frais capturés
      refundAmount = depositAmount - cancellationFee;

      console.log(`[Cancel] Deposit: ${depositAmount/100}€, Fee: ${cancellationFee/100}€, Refund: ${refundAmount/100}€`);

      // Handle based on payment intent status
      if (paymentIntent.status === "requires_capture") {
        // Payment was authorized but not captured yet
        if (chargePercentage === 0) {
          // No fee - cancel the authorization completely
          await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
          console.log(`[Cancel] Payment intent cancelled (no fee)`);
        } else if (chargePercentage === 100) {
          // Full fee - capture the full amount
          await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
          console.log(`[Cancel] Payment intent captured (full fee)`);
        } else {
          // Partial fee - capture partial amount
          await stripe.paymentIntents.capture(booking.stripePaymentIntentId, {
            amount_to_capture: cancellationFee,
          });
          console.log(`[Cancel] Payment intent partially captured: ${cancellationFee/100}€`);
        }
      } else if (paymentIntent.status === "succeeded") {
        // Payment was already captured - need to refund
        if (refundAmount > 0) {
          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundAmount,
          });
          console.log(`[Cancel] Refund created: ${refundAmount/100}€`);
        }
      }

      // Update payment record
      await Payment.updateOne(
        { stripePaymentIntentId: booking.stripePaymentIntentId },
        {
          $set: {
            status: chargePercentage === 0 ? "cancelled" : "refunded",
            refundAmount: refundAmount / 100,
            cancellationFee: cancellationFee / 100,
          },
        }
      );
    } else if (booking.stripeSetupIntentId) {
      // Setup intent was created but no payment intent yet - just cancel
      try {
        await stripe.setupIntents.cancel(booking.stripeSetupIntentId);
        console.log(`[Cancel] Setup intent cancelled`);
      } catch (stripeError) {
        console.error(`[Cancel] Error cancelling setup intent:`, stripeError);
        // Don't block cancellation if Stripe fails
      }
    }

    // Store original status before changing it (needed for email template)
    const wasPending = booking.status === "pending";

    // Update booking status
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = reason || "Annulée par l'administrateur";
    booking.cancellationFee = cancellationFee / 100;
    booking.refundAmount = refundAmount / 100;
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
      contactEmail: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
    };

    // Envoyer l'email d'annulation
    try {
      const { sendEmail } = await import('@/lib/email/emailService');
      const recipientEmail = user?.email || populatedBooking.contactEmail;

      if (!recipientEmail) {
        console.warn('⚠️ Aucun email trouvé pour envoyer la notification d\'annulation');
      } else {
        // Préparer les données pour l'email avec informations sur les frais
        const emailDataWithFees = {
          ...emailData,
          confirmationNumber: populatedBooking._id.toString(),
          cancellationFees: cancellationFee / 100,
          refundAmount: refundAmount / 100,
          isPending: wasPending, // Pour template différent si réservation pending
          daysUntilBooking: daysUntilBooking,
          chargePercentage: chargePercentage,
        };

        // Choisir le template selon isAdminBooking ET les frais
        if (populatedBooking.isAdminBooking) {
          // Template admin : pas de mention de paiement
          const { generateAdminCancelAdminBookingEmail } = await import('@coworking-cafe/email');

          await sendEmail({
            to: recipientEmail,
            subject: '❌ Réservation annulée - CoworKing Café',
            html: generateAdminCancelAdminBookingEmail(emailData),
          });
        } else if (wasPending || chargePercentage === 0) {
          // Réservation pending ou annulation gratuite : pas de frais
          const { generateReservationRejectedEmail } = await import('@coworking-cafe/email');

          await sendEmail({
            to: recipientEmail,
            subject: '❌ Réservation annulée - CoworKing Café',
            html: generateReservationRejectedEmail({
              ...emailData,
              confirmationNumber: populatedBooking._id.toString(),
            }),
          });
        } else {
          // Annulation avec frais : utiliser template avec détails des frais
          // TODO: Créer template spécifique pour annulation avec frais
          // Pour l'instant, utiliser le template classique
          const { generateReservationRejectedEmail } = await import('@coworking-cafe/email');

          await sendEmail({
            to: recipientEmail,
            subject: '❌ Réservation annulée avec frais - CoworKing Café',
            html: generateReservationRejectedEmail(emailDataWithFees),
          });
        }

        console.log(`✅ Email d'annulation envoyé: ${recipientEmail} (Frais: ${chargePercentage}%)`);
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
        daysUntilBooking,
        chargePercentage,
        cancellationFee: cancellationFee / 100,
        refundAmount: refundAmount / 100,
        cancellationMessage:
          chargePercentage === 0
            ? "Aucun frais appliqué. L'empreinte bancaire est annulée."
            : chargePercentage === 100
            ? "Annulation tardive. Le montant total est retenu."
            : `Frais d'annulation de ${chargePercentage}% appliqués. ${
                refundAmount / 100
              }€ sera libéré.`,
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
