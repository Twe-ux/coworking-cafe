import { getAuthUser } from "@/lib/api-helpers";
import { businessDaysUntil } from "@/lib/business-days";
import { sendCancellationConfirmation } from "@/lib/email/emailService";
import { logger } from "@/lib/logger";
import { connectDB } from "@/lib/mongodb";
import { getSpaceTypeName } from "@/lib/space-names";
import BookingSettings from "@/models/bookingSettings";
import { Payment } from "@coworking-cafe/database";
import { Booking } from "@coworking-cafe/database";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/[id]/cancel
 * Cancel a reservation and handle payment refund/release based on cancellation policy
 *
 * Flow:
 * 1. Validate user has permission to cancel
 * 2. Check booking is cancellable (not already cancelled/completed)
 * 3. Calculate cancellation fee based on days until booking and policy
 * 4. Handle Stripe payment intent (cancel/release/partial refund)
 * 5. Update booking status
 * 6. Send confirmation email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const bookingId = params.id;
    const user = await getAuthUser();

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await Booking.findById(bookingId)
      .populate("user", "email givenName")
      .populate("space", "name type");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isAdmin = user?.role?.level && user.role.level >= 50;
    const isOwner =
      user &&
      booking.user &&
      (typeof booking.user === "object" && "_id" in booking.user
        ? (booking.user._id as unknown as string).toString()
        : booking.user.toString()) === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === "completed") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel completed booking" },
        { status: 400 }
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

    // Calculate calendar days until booking
    const bookingDate = new Date(booking.date);
    const daysUntilBooking = businessDaysUntil(bookingDate);

    // Determine cancellation charge percentage
    let chargePercentage = 100; // Default to full charge

    // IMPORTANT: Pending bookings (not yet validated by admin) can be cancelled without fees
    if (booking.status === "pending") {
      chargePercentage = 0;
      logger.info("Pending booking - no cancellation fee", {
        component: "Booking Cancellation",
        data: {
          bookingId: bookingId,
          status: booking.status,
        },
      });
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

    logger.info("Cancellation fee calculation", {
      component: "Booking Cancellation",
      data: {
        bookingId: bookingId,
        daysUntilBooking,
        chargePercentage,
      },
    });

    // Handle Stripe payment
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

      logger.info("Payment intent details", {
        component: "Booking Cancellation",
        data: {
          bookingId: bookingId,
          status: paymentIntent.status,
          bookingTotal: bookingTotalInCents / 100,
          depositAmount: depositAmount / 100,
          chargePercentage,
          cancellationFee: cancellationFee / 100,
          refundAmount: refundAmount / 100,
        },
      });

      // Handle based on payment intent status
      if (paymentIntent.status === "requires_capture") {
        // Payment was authorized but not captured yet
        if (chargePercentage === 0) {
          // No fee - cancel the authorization completely
          await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
          logger.info("Payment intent cancelled (no fee)", {
            component: "Booking Cancellation",
            data: {
              bookingId: bookingId,
            },
          });
        } else if (chargePercentage === 100) {
          // Full fee - capture the full amount
          await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
          logger.info("Payment intent captured (full fee)", {
            component: "Booking Cancellation",
            data: {
              bookingId: bookingId,
              amount: depositAmount / 100,
            },
          });
        } else {
          // Partial fee - capture partial amount
          await stripe.paymentIntents.capture(booking.stripePaymentIntentId, {
            amount_to_capture: cancellationFee,
          });
          logger.info("Payment intent partially captured", {
            component: "Booking Cancellation",
            data: {
              bookingId: bookingId,
              capturedAmount: cancellationFee,
            },
          });
        }
      } else if (paymentIntent.status === "succeeded") {
        // Payment was already captured - need to refund
        if (refundAmount > 0) {
          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundAmount,
          });
          logger.info("Refund created", {
            component: "Booking Cancellation",
            data: {
              bookingId: bookingId,
              refundAmount,
            },
          });
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
      const setupIntent = await stripe.setupIntents.retrieve(
        booking.stripeSetupIntentId
      );

      if (setupIntent.status === "requires_payment_method") {
        await stripe.setupIntents.cancel(booking.stripeSetupIntentId);
        logger.info("Setup intent cancelled", {
          component: "Booking Cancellation",
          data: {
            bookingId: bookingId,
          },
        });
      }
    }

    // Store original status before changing it (needed for email template)
    const wasPending = booking.status === "pending";

    // Update booking status
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationFee = cancellationFee / 100;
    booking.refundAmount = refundAmount / 100;
    if (user?.id) {
      booking.cancelledBy = new mongoose.Types.ObjectId(user.id) as any;
    }
    await booking.save();

    // Send confirmation email
    try {
      const userEmail = booking.contactEmail || (booking.user as any)?.email;
      const userName = booking.contactName || (booking.user as any)?.givenName;
      const spaceName =
        typeof booking.space === "object" &&
        booking.space &&
        "name" in booking.space
          ? (booking.space as { name: string }).name
          : getSpaceTypeName(booking.spaceType);

      if (userEmail) {
        await sendCancellationConfirmation(userEmail, {
          name: userName,
          spaceName,
          date: new Date(booking.date).toLocaleDateString("fr-FR"),
          startTime: booking.startTime || "",
          endTime: booking.endTime || "",
          numberOfPeople: booking.numberOfPeople,
          totalPrice: booking.totalPrice,
          contactEmail: process.env.CONTACT_EMAIL || "contact@coworkingcafe.fr",
          cancellationFees: cancellationFee / 100,
          refundAmount: refundAmount / 100,
          confirmationNumber: booking.confirmationNumber,
        });

        logger.info("Cancellation email sent", {
          component: "Booking Cancellation",
          data: {
            bookingId: bookingId,
            email: userEmail,
          },
        });
      }
    } catch (emailError) {
      logger.error("Failed to send cancellation email", {
        component: "Booking Cancellation",
        data: {
          bookingId: bookingId,
          error: emailError instanceof Error ? emailError.message : "Unknown",
        },
      });
      // Don't fail the whole process if email fails
    }

    logger.info("Booking cancelled successfully", {
      component: "Booking Cancellation",
      data: {
        bookingId: bookingId,
        daysUntilBooking,
        chargePercentage,
        cancellationFee: cancellationFee / 100,
        refundAmount: refundAmount / 100,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        bookingId: booking._id,
        status: booking.status,
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
              }€ sera remboursé.`,
      },
    });
  } catch (error) {
    logger.error("Booking cancellation failed", {
      component: "Booking Cancellation",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
