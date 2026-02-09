import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"

/**
 * PUT /api/booking/reservations/[id]/validate
 * Valider une réservation en attente (changer status de 'pending' à 'confirmed')
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

    // Trouver la réservation
    const booking = await Booking.findById(id).populate('user', 'firstName lastName email')

    if (!booking) {
      return errorResponse("Réservation introuvable", undefined, 404)
    }

    if (booking.status !== 'pending') {
      return errorResponse("Cette réservation n'est pas en attente de validation", undefined, 400)
    }

    // Mettre à jour le statut
    booking.status = 'confirmed'
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
      confirmationNumber: booking._id.toString(),
      contactEmail: process.env.CONTACT_EMAIL || 'strasbourg@coworkingcafe.fr',
    }

    // Envoyer l'email de confirmation
    try {
      const { sendEmail } = await import('@/lib/email/emailService')
      const { generateBookingValidationEmail } = await import('@coworking-cafe/email')

      // Choisir le variant selon isAdminBooking
      const variant = booking.isAdminBooking ? 'admin' : 'client'

      await sendEmail({
        to: user.email || booking.contactEmail || '',
        subject: booking.isAdminBooking ? '✅ Réservation confirmée - CoworKing Café' : '🎉 Réservation validée - CoworKing Café',
        html: generateBookingValidationEmail(emailData, variant),
      })

      console.log('✅ Email de validation envoyé:', user.email || booking.contactEmail)
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
      // Ne pas bloquer la validation si l'email échoue
    }

    // Retourner la réservation validée
    return successResponse(
      {
        _id: booking._id.toString(),
        status: booking.status,
        updatedAt: booking.updatedAt.toISOString(),
      },
      "Réservation validée avec succès"
    )
  } catch (error) {
    console.error("PUT /api/booking/reservations/[id]/validate error:", error)
    return errorResponse("Erreur lors de la validation de la réservation", undefined, 500)
  }
}
