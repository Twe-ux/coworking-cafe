import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"

/**
 * PUT /api/booking/reservations/[id]/reject
 * Refuser une réservation (changer status de 'pending' à 'cancelled')
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    const { id } = params
    const body = await request.json()
    const { reason } = body // Raison du refus (optionnelle)

    // Trouver la réservation
    const booking = await Booking.findById(id).populate('user', 'firstName lastName email')

    if (!booking) {
      return errorResponse("Réservation introuvable", undefined, 404)
    }

    if (booking.status === 'cancelled') {
      return errorResponse("Cette réservation est déjà annulée", undefined, 400)
    }

    // Mettre à jour le statut
    booking.status = 'cancelled'
    if (reason) {
      booking.cancelReason = reason
    }
    booking.cancelledAt = new Date()
    await booking.save()

    // Préparer les données pour l'email
    const user = (booking.user || {}) as { firstName?: string; lastName?: string; email?: string }
    const clientName = (user.firstName && user.lastName)
      ? `${user.firstName} ${user.lastName}`
      : booking.contactName || user.email || booking.contactEmail || 'Client'

    const emailData = {
      name: clientName,
      spaceName: booking.spaceType,
      date: booking.date.toISOString().split("T")[0],
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      numberOfPeople: booking.numberOfPeople,
      totalPrice: booking.totalPrice,
      reason: reason || undefined,
    }

    // Envoyer l'email de refus
    try {
      const { sendEmail } = await import('@/lib/email/emailService')

      // Choisir le template selon isAdminBooking
      if (booking.isAdminBooking) {
        // Template admin : pas de mention de libération d'empreinte bancaire
        const { generateAdminBookingRejectionEmail } = await import('@coworking-cafe/email')

        await sendEmail({
          to: user.email || booking.contactEmail || '',
          subject: '❌ Réservation refusée - CoworKing Café',
          html: generateAdminBookingRejectionEmail(emailData),
        })
      } else {
        // Template classique : avec mention de libération d'empreinte bancaire
        const { generateReservationRejectedEmail } = await import('@coworking-cafe/email')

        await sendEmail({
          to: user.email || booking.contactEmail || '',
          subject: '❌ Réservation refusée - CoworKing Café',
          html: generateReservationRejectedEmail({
            ...emailData,
            confirmationNumber: booking._id.toString(),
          }),
        })
      }

      console.log('✅ Email de refus envoyé:', user.email || booking.contactEmail)
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
      // Ne pas bloquer le refus si l'email échoue
    }

    // Retourner la réservation refusée
    return successResponse(
      {
        _id: booking._id.toString(),
        status: booking.status,
        cancelReason: booking.cancelReason,
        cancelledAt: booking.cancelledAt?.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      },
      "Réservation refusée avec succès"
    )
  } catch (error) {
    console.error("PUT /api/booking/reservations/[id]/reject error:", error)
    return errorResponse("Erreur lors du refus de la réservation", undefined, 500)
  }
}
