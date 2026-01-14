import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { Reservation } from "@/models/reservation";
import GlobalHoursConfiguration from "@/models/globalHours";
import { options } from "@/lib/auth-options";
import { logger } from "@/lib/logger";
import {
  sendReservationConfirmed,
  sendReservationCancelled,
  sendDepositReleased,
  sendDepositCaptured,
} from "@/lib/email/emailService";
import SpaceConfiguration from "@/models/spaceConfiguration";

/**
 * PATCH /api/admin/reservations/[id]
 * Update reservation status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { status, paymentStatus, attendanceStatus } = body;

    // Check permissions:
    // - Staff (level >= 50) can only update attendanceStatus
    // - Admin (level >= 80) can update everything
    const isAdmin = session.user.role.level >= 80;
    const isStaff = session.user.role.level >= 50;

    if (!isAdmin && !isStaff) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Staff can only update attendance status
    if (!isAdmin && isStaff) {
      if (status || paymentStatus) {
        return NextResponse.json({
          error: "Staff ne peut modifier que la présence/absence"
        }, { status: 403 });
      }
    }

    // Get the old reservation to compare status changes
    const oldReservation = await Reservation.findById(params.id).populate("user", "name email username");

    if (!oldReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // IMPORTANT: If trying to confirm a reservation, check if payment is required
    if (status === "confirmed" && oldReservation.status !== "confirmed") {
      // If reservation requires payment, ensure payment intent exists and is authorized
      if (oldReservation.requiresPayment) {
        if (!oldReservation.stripePaymentIntentId && !oldReservation.stripeSetupIntentId) {
          return NextResponse.json(
            {
              error: "Impossible de confirmer : aucun paiement n'a été créé. Créez d'abord un paiement via 'Créer empreinte bancaire'."
            },
            { status: 400 }
          );
        }

        // Check if payment intent is authorized (for manual capture)
        if (oldReservation.stripePaymentIntentId) {
          try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const paymentIntent = await stripe.paymentIntents.retrieve(oldReservation.stripePaymentIntentId);

            // Only allow confirmation if payment is authorized or succeeded
            if (paymentIntent.status !== 'requires_capture' && paymentIntent.status !== 'succeeded') {
              return NextResponse.json(
                {
                  error: `Impossible de confirmer : le client n'a pas encore saisi sa carte bancaire. Statut actuel: ${paymentIntent.status}`,
                  paymentStatus: paymentIntent.status,
                },
                { status: 400 }
              );
            }
          } catch (stripeError) {
            return NextResponse.json(
              {
                error: "Erreur lors de la vérification du paiement Stripe",
                details: stripeError instanceof Error ? stripeError.message : 'Unknown error',
              },
              { status: 500 }
            );
          }
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (attendanceStatus) updateData.attendanceStatus = attendanceStatus;

    // Update completion timestamp if marking as completed
    if (status === "completed" && oldReservation.status !== "completed") {
      updateData.completedAt = new Date();
    }

    const reservation = await Reservation.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate("user", "name email username");

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Get space configuration for email
    const spaceConfig = await SpaceConfiguration.findOne({ spaceType: reservation.spaceType });

    // Send appropriate email based on status change
    const userEmail = reservation.contactEmail || (reservation.user as any).email;
    const userName = reservation.contactName || (reservation.user as any).name;

    try {
      // pending → confirmed: send confirmation email
      if (oldReservation.status === "pending" && status === "confirmed") {
        await sendReservationConfirmed(userEmail, {
          name: userName,
          spaceName: spaceConfig?.name || reservation.spaceType,
          date: new Date(reservation.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: reservation.startTime || "",
          endTime: reservation.endTime || "",
          numberOfPeople: reservation.numberOfPeople,
          totalPrice: reservation.totalPrice,
          confirmationNumber: reservation.confirmationNumber,
          paymentStatus: reservation.paymentStatus,
          invoiceOption: reservation.invoiceOption,
        });
        logger.info("Email de confirmation envoyé", { data: { reservationId: reservation._id } });
      }

      // attendanceStatus changed to "present": deposit released
      // Send email when marking as present (regardless of status change to completed)
      if (
        attendanceStatus === "present" &&
        oldReservation.attendanceStatus !== "present"
      ) {
        if (reservation.captureMethod === "manual" && reservation.requiresPayment) {
          // Calculate deposit amount
          const depositAmount = spaceConfig?.depositPolicy?.enabled
            ? spaceConfig.depositPolicy.fixedAmount ||
              Math.round(reservation.totalPrice * 100 * ((spaceConfig.depositPolicy.percentage || 100) / 100))
            : reservation.totalPrice * 100;

          await sendDepositReleased(userEmail, {
            name: userName,
            spaceName: spaceConfig?.name || reservation.spaceType,
            date: new Date(reservation.date).toLocaleDateString("fr-FR"),
            depositAmount: depositAmount / 100,
          });
          logger.info("Email empreinte levée envoyé", { data: { reservationId: reservation._id } });
        }
      }

      // attendanceStatus changed to "absent": deposit captured
      // Send email when marking as absent (regardless of status change to completed)
      if (
        attendanceStatus === "absent" &&
        oldReservation.attendanceStatus !== "absent"
      ) {
        if (reservation.captureMethod === "manual" && reservation.requiresPayment) {
          // Calculate deposit amount
          const depositAmount = spaceConfig?.depositPolicy?.enabled
            ? spaceConfig.depositPolicy.fixedAmount ||
              Math.round(reservation.totalPrice * 100 * ((spaceConfig.depositPolicy.percentage || 100) / 100))
            : reservation.totalPrice * 100;

          await sendDepositCaptured(userEmail, {
            name: userName,
            spaceName: spaceConfig?.name || reservation.spaceType,
            date: new Date(reservation.date).toLocaleDateString("fr-FR"),
            depositAmount: depositAmount / 100,
          });
          logger.info("Email empreinte encaissée envoyé", { data: { reservationId: reservation._id } });
        }
      }
    } catch (emailError) {
      logger.error("Erreur lors de l'envoi d'email", {
        data: {
          error: emailError,
          reservationId: reservation._id,
        },
      });
      // Don't fail the request if email fails
    }

    // Si c'est une réservation événementielle confirmée et que ce n'est pas une privatisation partielle,
    // créer automatiquement une fermeture exceptionnelle
    if (
      status === "confirmed" &&
      reservation.spaceType === "evenementiel" &&
      !reservation.isPartialPrivatization
    ) {
      try {
        // Récupérer la configuration globale
        const globalConfig = await GlobalHoursConfiguration.findOne().sort({ createdAt: -1 });

        if (globalConfig) {
          // Vérifier si une fermeture n'existe pas déjà pour cette date
          const existingClosure = globalConfig.exceptionalClosures.find((closure: any) => {
            const closureDate = new Date(closure.date);
            const reservationDate = new Date(reservation.date);
            return (
              closureDate.toISOString().split('T')[0] === reservationDate.toISOString().split('T')[0] &&
              closure.reason?.includes('Privatisation')
            );
          });

          if (!existingClosure) {
            // Ajouter la fermeture exceptionnelle
            const hasTimeRange = reservation.startTime && reservation.endTime;
            globalConfig.exceptionalClosures.push({
              date: reservation.date,
              reason: "Privatisation",
              startTime: hasTimeRange ? reservation.startTime : undefined,
              endTime: hasTimeRange ? reservation.endTime : undefined,
              isFullDay: !hasTimeRange,
            });

            await globalConfig.save();
            logger.info("Fermeture exceptionnelle créée automatiquement", {
              data: {
                reservationId: reservation._id,
                date: reservation.date,
                timeRange: `${reservation.startTime} - ${reservation.endTime}`,
              }
            });
          }
        }
      } catch (closureError) {
        // Log l'erreur mais ne pas faire échouer la mise à jour de réservation
        logger.error("Erreur lors de la création de la fermeture exceptionnelle", {
          data: {
            error: closureError,
            reservationId: reservation._id,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    logger.error("Error updating reservation", { component: "API /admin/reservations/[id] PATCH", data: error });
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reservations/[id]
 * Cancel/Reject reservation (admin only)
 * Body: { reason?: string } - Optional rejection reason
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Get rejection reason from body
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Get reservation before updating to check original status
    const oldReservation = await Reservation.findById(params.id).populate("user", "name email username");

    if (!oldReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const wasPending = oldReservation.status === "pending";

    // Update reservation to cancelled
    const reservation = await Reservation.findByIdAndUpdate(
      params.id,
      { status: "cancelled", cancelledAt: new Date() },
      { new: true }
    ).populate("user", "name email username");

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Get user and space info for email
    const userEmail = reservation.contactEmail || (reservation.user as any)?.email;
    const userName = reservation.contactName || (reservation.user as any)?.name;
    const spaceConfig = await SpaceConfiguration.findOne({ spaceType: reservation.spaceType });

    try {
      // If reservation was pending, send rejection email, otherwise send cancellation email
      if (wasPending) {
        // Import and use sendReservationRejected
        const { sendReservationRejected } = await import('@/lib/email/emailService');
        await sendReservationRejected(userEmail, {
          name: userName,
          spaceName: spaceConfig?.name || reservation.spaceType,
          date: new Date(reservation.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: reservation.startTime || "",
          endTime: reservation.endTime || "",
          numberOfPeople: reservation.numberOfPeople,
          totalPrice: reservation.totalPrice,
          confirmationNumber: reservation.confirmationNumber || "",
          reason: reason || undefined,
        });
        logger.info("Email de rejet envoyé", { data: { reservationId: reservation._id, reason } });
      } else {
        // Send regular cancellation email
        await sendReservationCancelled(userEmail, {
          name: userName,
          spaceName: spaceConfig?.name || reservation.spaceType,
          date: new Date(reservation.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: reservation.startTime || "",
          endTime: reservation.endTime || "",
          numberOfPeople: reservation.numberOfPeople,
          totalPrice: reservation.totalPrice,
          confirmationNumber: reservation.confirmationNumber || "",
        });
        logger.info("Email d'annulation envoyé", { data: { reservationId: reservation._id } });
      }
    } catch (emailError) {
      logger.error("Erreur lors de l'envoi d'email", {
        data: {
          error: emailError,
          reservationId: reservation._id,
          type: wasPending ? 'rejection' : 'cancellation',
        },
      });
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: wasPending ? "Reservation rejected successfully" : "Reservation cancelled successfully",
    });
  } catch (error) {
    logger.error("Error cancelling reservation", { component: "API /admin/reservations/[id] DELETE", data: error });
    return NextResponse.json(
      { error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
