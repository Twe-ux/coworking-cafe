import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { Reservation } from "@/models/reservation";
import GlobalHoursConfiguration from "@/models/globalHours";
import { options } from "@/lib/auth-options";
import { logger } from "@/lib/logger";
import { sendReservationConfirmed, sendReservationCancelled } from "@/lib/email/emailService";

/**
 * GET /api/admin/reservations
 * Get all reservations (admin only)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const attendanceStatus = searchParams.get("attendanceStatus");
    const spaceType = searchParams.get("spaceType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (attendanceStatus) {
      query.attendanceStatus = attendanceStatus;
    }

    if (spaceType) {
      query.spaceType = spaceType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    const reservations = await Reservation.find(query)
      .populate("user", "name email username")
      .sort({ date: -1, startTime: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Reservation.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit,
      },
    });
  } catch (error) {
    logger.error("Error fetching reservations", { component: "API /admin/reservations", data: error });
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reservations
 * Create a new reservation (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    await connectDB();

    const reservation = await Reservation.create({
      user: session.user.id,
      spaceType: body.spaceType,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      numberOfPeople: body.numberOfPeople,
      basePrice: body.totalPrice || 0, // Pour l'instant, basePrice = totalPrice (pas de services additionnels)
      servicesPrice: 0,
      totalPrice: body.totalPrice,
      status: body.status || 'pending',
      paymentStatus: body.paymentStatus || 'unpaid',
      amountPaid: body.amountPaid || 0,
      invoiceOption: body.invoiceOption || false,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      isPartialPrivatization: body.isPartialPrivatization || false,
    });

    // Send confirmation email if status is "confirmed"
    if (reservation.status === "confirmed") {
      try {
        const spaceTypeLabels: Record<string, string> = {
          "open-space": "Open-space",
          "salle-verriere": "Salle Verrière",
          "salle-etage": "Salle Étage",
          "evenementiel": "Événementiel",
          "desk": "Bureau",
          "meeting-room": "Salle de réunion",
          "private-office": "Bureau privé",
          "event-space": "Espace événementiel",
        };

        const emailTo = reservation.contactEmail || session.user.email;

        if (emailTo) {
          await sendReservationConfirmed(emailTo, {
            name: reservation.contactName || session.user.name || "Client",
            spaceName: spaceTypeLabels[reservation.spaceType] || reservation.spaceType,
            date: new Date(reservation.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            startTime: reservation.startTime || "",
            endTime: reservation.endTime || "",
            numberOfPeople: reservation.numberOfPeople,
            totalPrice: reservation.totalPrice,
            confirmationNumber: reservation.confirmationNumber,
            paymentStatus: reservation.paymentStatus,
            invoiceOption: reservation.invoiceOption,
          });

          logger.info("Confirmation email sent for new reservation", {
            component: "API /admin/reservations POST",
            data: {
              reservationId: reservation._id,
              email: emailTo,
            }
          });
        }
      } catch (emailError) {
        logger.error("Failed to send confirmation email for new reservation", {
          component: "API /admin/reservations POST",
          data: emailError,
        });
        // Don't fail the request if email fails
      }

      // Si c'est une réservation événementielle confirmée et que ce n'est pas une privatisation partielle,
      // créer automatiquement une fermeture exceptionnelle
      if (
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
              logger.info("Fermeture exceptionnelle créée automatiquement lors de la création", {
                data: {
                  reservationId: reservation._id,
                  date: reservation.date,
                  timeRange: `${reservation.startTime} - ${reservation.endTime}`,
                }
              });
            }
          }
        } catch (closureError) {
          // Log l'erreur mais ne pas faire échouer la création de réservation
          logger.error("Erreur lors de la création de la fermeture exceptionnelle", {
            data: {
              error: closureError,
              reservationId: reservation._id,
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    logger.error("Error creating reservation", { component: "API /admin/reservations POST", data: error });

    // Return detailed error for debugging
    const errorMessage = error.message || "Failed to create reservation";
    const validationErrors = error.errors ? Object.keys(error.errors).map(key => ({
      field: key,
      message: error.errors[key].message
    })) : null;

    return NextResponse.json(
      {
        error: errorMessage,
        validationErrors,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reservations
 * Update a reservation (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de réservation requis" }, { status: 400 });
    }

    await connectDB();

    // Get the reservation before update to check status change
    const oldReservation = await Reservation.findById(id);

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "name email username");

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    // Send confirmation email if status changed to "confirmed"
    if (
      oldReservation &&
      oldReservation.status !== "confirmed" &&
      reservation.status === "confirmed"
    ) {
      try {
        const spaceTypeLabels: Record<string, string> = {
          "open-space": "Open-space",
          "salle-verriere": "Salle Verrière",
          "salle-etage": "Salle Étage",
          "evenementiel": "Événementiel",
          "desk": "Bureau",
          "meeting-room": "Salle de réunion",
          "private-office": "Bureau privé",
          "event-space": "Espace événementiel",
        };

        const emailTo = reservation.contactEmail || session.user.email;

        if (emailTo) {
          await sendReservationConfirmed(emailTo, {
            name: reservation.contactName || session.user.name || "Client",
            spaceName: spaceTypeLabels[reservation.spaceType] || reservation.spaceType,
            date: new Date(reservation.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            startTime: reservation.startTime || "",
            endTime: reservation.endTime || "",
            numberOfPeople: reservation.numberOfPeople,
            totalPrice: reservation.totalPrice,
            confirmationNumber: reservation.confirmationNumber,
            paymentStatus: reservation.paymentStatus,
            invoiceOption: reservation.invoiceOption,
          });

          logger.info("Confirmation email sent", {
            component: "API /admin/reservations PATCH",
            data: {
              reservationId: reservation._id,
              email: emailTo,
            }
          });
        }
      } catch (emailError) {
        logger.error("Failed to send confirmation email", {
          component: "API /admin/reservations PATCH",
          data: emailError,
        });
        // Don't fail the request if email fails
      }
    }

    // Send cancellation email if status changed to "cancelled"
    if (
      oldReservation &&
      oldReservation.status !== "cancelled" &&
      reservation.status === "cancelled"
    ) {
      try {
        const spaceTypeLabels: Record<string, string> = {
          "open-space": "Open-space",
          "salle-verriere": "Salle Verrière",
          "salle-etage": "Salle Étage",
          "evenementiel": "Événementiel",
          "desk": "Bureau",
          "meeting-room": "Salle de réunion",
          "private-office": "Bureau privé",
          "event-space": "Espace événementiel",
        };

        const emailTo = reservation.contactEmail || session.user.email;

        if (emailTo) {
          await sendReservationCancelled(emailTo, {
            name: reservation.contactName || session.user.name || "Client",
            spaceName: spaceTypeLabels[reservation.spaceType] || reservation.spaceType,
            date: new Date(reservation.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            startTime: reservation.startTime || "",
            endTime: reservation.endTime || "",
            numberOfPeople: reservation.numberOfPeople,
            totalPrice: reservation.totalPrice,
            confirmationNumber: reservation.confirmationNumber,
          });

          logger.info("Cancellation email sent", {
            component: "API /admin/reservations PATCH",
            data: {
              reservationId: reservation._id,
              email: emailTo,
            }
          });
        }
      } catch (emailError) {
        logger.error("Failed to send cancellation email", {
          component: "API /admin/reservations PATCH",
          data: emailError,
        });
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    logger.error("Error updating reservation", { component: "API /admin/reservations PATCH", data: error });

    const errorMessage = error.message || "Failed to update reservation";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

