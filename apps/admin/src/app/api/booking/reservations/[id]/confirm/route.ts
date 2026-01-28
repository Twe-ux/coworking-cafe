import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@coworking-cafe/database";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";

/**
 * POST /api/booking/reservations/[id]/confirm
 * Confirm a pending booking
 * Only accessible by dev/admin/manager
 */
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

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse("Réservation introuvable", "Booking not found", 404);
    }

    // Check if booking is pending
    if (booking.status !== "pending") {
      return errorResponse(
        "Réservation déjà traitée",
        `Booking status is ${booking.status}`,
        400
      );
    }

    // Update status to confirmed
    booking.status = "confirmed";
    await booking.save();

    // TODO: Send confirmation email to client

    return successResponse(
      { _id: booking._id, status: booking.status },
      "Réservation confirmée avec succès"
    );
  } catch (error) {
    console.error("[API] Confirm booking error:", error);
    return errorResponse(
      "Erreur lors de la confirmation de la réservation",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
