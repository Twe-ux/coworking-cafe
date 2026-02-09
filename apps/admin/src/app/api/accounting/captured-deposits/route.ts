import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import type { CapturedDeposit } from "@/types/accounting";

/**
 * Interface pour un user populé
 */
interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

/**
 * Interface pour un booking populé
 */
interface PopulatedBooking {
  _id: string;
  user?: PopulatedUser;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  companyName?: string;
  spaceType: string;
  date: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  depositAmount?: number;
  stripePaymentIntentId?: string;
  captureMethod?: string;
  isAdminBooking?: boolean;
}

/**
 * GET /api/accounting/captured-deposits
 * Récupère la liste des empreintes bancaires capturées (no-show et annulations)
 * Accessible par dev/admin uniquement
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectMongoose();

    // Filtrer les bookings avec empreinte capturée
    // Critères :
    // 1. status = "cancelled"
    // 2. stripePaymentIntentId existe
    // 3. captureMethod = "manual" (empreinte 90j Stripe)
    // 4. !isAdminBooking (pas de réservation admin)
    // 5. cancelReason contient "No-show" OU est une annulation client avec capture
    const bookings = await Booking.find({
      status: "cancelled",
      stripePaymentIntentId: { $exists: true, $ne: null },
      captureMethod: "manual",
      $or: [
        { isAdminBooking: { $ne: true } },
        { isAdminBooking: { $exists: false } }
      ],
      cancelReason: { $exists: true, $nin: [null, ""] },
    })
      .populate<{ user?: PopulatedUser }>("user", "firstName lastName email")
      .sort({ cancelledAt: -1 }) // Plus récent en premier
      .lean() as unknown as PopulatedBooking[];

    // Transformer les données
    const capturedDeposits: CapturedDeposit[] = bookings.map((booking) => {
      // Nom du client
      let userName = "Guest";
      let userEmail = "";

      if (booking.user) {
        const firstName = booking.user.firstName || "";
        const lastName = booking.user.lastName || "";
        userName = `${firstName} ${lastName}`.trim() || "Client";
        userEmail = booking.user.email;
      } else if (booking.contactName) {
        userName = booking.contactName;
        userEmail = booking.contactEmail || "";
      }

      // Société (prioritaire sur le nom du client)
      const companyName = booking.contactCompany || booking.companyName || undefined;

      // Formater les dates
      const bookingDate = booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date).split('T')[0];

      const cancelledAt = booking.cancelledAt instanceof Date
        ? booking.cancelledAt.toISOString().split('T')[0]
        : booking.cancelledAt
        ? String(booking.cancelledAt).split('T')[0]
        : bookingDate;

      return {
        _id: booking._id.toString(),
        userName,
        userEmail,
        companyName,
        bookingDate,
        cancelledAt,
        depositAmount: booking.depositAmount || 0,
        cancelReason: booking.cancelReason || "Non spécifié",
        spaceType: booking.spaceType,
      };
    });

    // Calculer le total capturé
    const totalCaptured = capturedDeposits.reduce(
      (sum, deposit) => sum + deposit.depositAmount,
      0
    );

    return successResponse({
      deposits: capturedDeposits,
      totalCaptured,
      count: capturedDeposits.length,
    }, "Empreintes capturées récupérées");

  } catch (error) {
    console.error("[API] Error fetching captured deposits:", error);
    return errorResponse(
      "Erreur lors de la récupération des empreintes",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
