import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import { sendNewBookingNotification } from "@/lib/push-notifications"

/**
 * POST /api/notifications/booking
 * Envoie une notification push pour une nouvelle réservation en attente
 * Appelé par le site après création d'une réservation
 */
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

    // Récupérer la réservation
    const booking = await Booking.findById(bookingId)
      .populate("user", "firstName lastName email")
      .lean()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      )
    }

    // Compter les réservations en attente
    const pendingCount = await Booking.countDocuments({ status: "pending" })

    // Préparer les données pour la notification
    const bookingAny = booking as any
    const user = bookingAny.user || {}
    const clientName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : bookingAny.contactName || user.email || "Client"

    // Formater la date
    const bookingDate = new Date(bookingAny.date)
    const formattedDate = bookingDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    })

    // Envoyer la notification push
    await sendNewBookingNotification({
      id: bookingId,
      clientName,
      spaceName: bookingAny.spaceType || "Espace",
      date: formattedDate,
      time: bookingAny.startTime || "Journée",
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
