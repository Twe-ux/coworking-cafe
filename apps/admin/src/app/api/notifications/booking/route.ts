import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Booking, BookingDocument } from "@coworking-cafe/database"
import { sendNewBookingNotification } from "@/lib/push-notifications"
import { Types } from "mongoose"

/**
 * Interface pour un document Booking populé avec les informations de l'utilisateur
 */
interface PopulatedUser {
  _id: Types.ObjectId
  firstName?: string
  lastName?: string
  email: string
}

interface PopulatedBooking extends Omit<BookingDocument, 'user'> {
  user?: PopulatedUser
}

/**
 * POST /api/notifications/booking
 * Envoie une notification push pour une nouvelle réservation en attente
 * Appelé par le site après création d'une réservation
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Vérifier le token d'authentification inter-services
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.NOTIFICATIONS_SECRET

    // Vérifier le token secret (apps/site -> apps/admin)
    const isValidToken = expectedToken && authHeader === `Bearer ${expectedToken}`

    // Refuser si pas de token valide en production
    if (!isValidToken && process.env.NODE_ENV === "production") {
      console.error("[Notifications/Booking] Invalid authorization token in production")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // En dev, on log un warning mais on continue
    if (!isValidToken) {
      console.warn("[Notifications/Booking] ⚠️ Request without valid token in development mode")
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Récupérer la réservation avec typage correct
    const booking = await Booking.findById(bookingId)
      .populate("user", "firstName lastName email")
      .lean() as PopulatedBooking | null

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      )
    }

    // Compter les réservations en attente
    const pendingCount = await Booking.countDocuments({ status: "pending" })

    // Préparer les données pour la notification avec typage strict
    const user = booking.user
    const clientName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : booking.contactName || user?.email || "Client"

    // Formater la date
    const bookingDate = new Date(booking.date)
    const formattedDate = bookingDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    })

    // Envoyer la notification push
    await sendNewBookingNotification({
      id: bookingId,
      clientName,
      spaceName: booking.spaceType || "Espace",
      date: formattedDate,
      time: booking.startTime || "Journée",
      pendingCount,
    })

    console.log(`[Notifications/Booking] Notification sent for booking ${bookingId}`)

    return NextResponse.json({
      success: true,
      message: "Notification sent",
      pendingCount,
    })
  } catch (error) {
    console.error("[Notifications/Booking] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    )
  }
}
